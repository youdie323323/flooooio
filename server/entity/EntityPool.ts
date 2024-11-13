import uWS from 'uWebSockets.js';
import { PacketKind } from "../../shared/packet";
import { MobType, PetalType } from "../../shared/types";
import { Mob, MobInstance, MOB_SIZE_FACTOR, MobData } from "./mob/Mob";
import { Player, PlayerData, PlayerInstance } from "./player/Player";
import { onUpdateTick } from "./Entity";
import { generateId, getRandomAngle, getRandomSafePosition, isPetal, kickClient } from './common/common';
import { Rarities } from '../../shared/rarities';
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from './EntityChecksum';
import { MOB_PROFILES } from '../../shared/mobProfiles';
import { PETAL_PROFILES } from '../../shared/petalProfiles';
import { PetalData, StaticPetalData } from './mob/petal/Petal';
import { USAGE_RELOAD_PETALS } from './player/PlayerReload';
import { MoodKind, MOON_KIND_VALUES } from '../../shared/mood';
import { logger } from '../main';
import WaveRoom from '../wave/WaveRoom';

// Define UserData for WebSocket connections
export interface UserData {
    waveRoomClientId: number;
    waveClientId: number;
    wavePlayerData: PlayerData;
}

export const UPDATE_FPS = 60;

export class EntityPool {
    public clients: Map<number, PlayerInstance>;
    public mobs: Map<number, MobInstance>;
    private updateInterval: NodeJS.Timeout;

    constructor(private readonly waveRoom: WaveRoom) {
        this.clients = new Map();
        this.mobs = new Map();
    }

    public startWave(waveRoom: WaveRoom) {
        const waveStartBuffer = Buffer.alloc(2);

        waveStartBuffer.writeUInt8(PacketKind.WAVE_ROOM_STARTING, 0);

        waveStartBuffer.writeUInt8(waveRoom.biome, 1);

        waveRoom.roomCandidates.forEach(player => {
            const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, this);
            if (!randPos) {
                return null;
            }

            this.addClient(player, randPos.x, randPos.y);

            player.ws.send(waveStartBuffer, true);
        });

        this.broadcastInitPacket();

        this.updateInterval = setInterval(() => this.update(), 1000 / UPDATE_FPS);

        setTimeout(() => {
            setInterval(() => {
                const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, this);
                if (!randPos) {
                    return null;
                }

                this.addPetalOrMob(MobType.BUBBLE, Rarities.MYTHIC, randPos.x, randPos.y, null, null);
            }, 10);
        }, 20000);
    }

    public endWave() {
        clearInterval(this.updateInterval);
    }

    addClient(playerData: PlayerData, x: number, y: number): PlayerInstance | null {
        const clientId = generateId();

        // Ensure unique clientId
        if (this.getAllClients().map(v => v.id).includes(clientId)) {
            return this.addClient(playerData, x, y);
        }

        // 100 is level
        const levelMultiplier: number = (243 ** 0.01) ** (Math.max(100, 75) - 0.5);

        const playerInstance = new Player({
            id: clientId,
            x,
            y,
            angle: 0,
            magnitude: 0,
            mood: 0,
            size: 15,
            health: 200 * levelMultiplier,
            bodyDamage: 25 * levelMultiplier,
            // Not changing
            maxHealth: 200 * levelMultiplier,
            isDead: false,
            nickname: playerData.name,
            ws: playerData.ws,
            slots: {
                surface: null,
                bottom: null,
                cooldownsPetal: new Array(playerData.slots.surface.length).fill(0),
                cooldownsUsage: new Array(playerData.slots.surface.length).fill(0),
            },
        });

        playerInstance.slots.surface = playerData.slots.surface.map(c => this.staticPetalDataToReal(c, playerInstance));
        playerInstance.slots.bottom = playerData.slots.bottom.map(c => this.staticPetalDataToReal(c, playerInstance));

        this.clients.set(clientId, playerInstance);

        playerData.ws.getUserData().waveClientId = clientId;

        logger.region(() => {
            using _guard = logger.metadata({ clientId });
            logger.info("Added player on wave");
        });

        return playerInstance;
    }

    addPetalOrMob(type: MobType | PetalType, rarity: Rarities, x: number, y: number, petalParent: PlayerInstance = null, eggParent: PlayerInstance = null): MobInstance | null {
        const mobId = generateId();
        if (this.mobs.has(mobId)) {
            return this.addPetalOrMob(type, rarity, x, y, petalParent, eggParent);
        }

        const profile: MobData | PetalData = MOB_PROFILES[type] || PETAL_PROFILES[type];

        const mobInstance = new Mob({
            id: mobId,
            type,
            x,
            y,
            angle: getRandomAngle(),
            magnitude: 0,
            rarity,
            size: isPetal(type) ? 6 : ((profile as MobData).baseSize * MOB_SIZE_FACTOR[rarity]),
            health: profile[rarity].health,
            // Not changing
            maxHealth: profile[rarity].health,

            mobTargetEntity: null,

            mobLastAttackedBy: null,

            isUsagePetal: USAGE_RELOAD_PETALS.has(type),

            petParentPlayer: eggParent,
            petGoingToPlayer: false,

            petalParentPlayer: petalParent,
            petalSummonedPet: null,

            starfishRegeningHealth: false,
        });

        this.mobs.set(mobId, mobInstance);

        return mobInstance;
    }

    private staticPetalDataToReal(sp: StaticPetalData | null, parent: PlayerInstance): MobInstance | null {
        if (!sp) {
            return null;
        }

        const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, this);
        if (!randPos) {
            return null;
        }

        return this.addPetalOrMob(sp.type, sp.rarity, randPos.x, randPos.y, parent, parent);
    }

    private update() {
        this.clients.forEach((client) => {
            if (client[onUpdateTick]) {
                client[onUpdateTick](this);
            }
        });

        this.mobs.forEach((mob) => {
            if (mob[onUpdateTick]) {
                mob[onUpdateTick](this);
            }
        });

        this.broadcastUpdatePacket();
    }

    // Begin updaters

    updateMovement(clientId: number, angle: number, magnitude: number) {
        const client = this.clients.get(clientId);
        if (client && !client.isDead) {
            if (
                magnitude < 0 || magnitude > 255 ||
                angle < 0 || angle > 256
            ) {
                logger.region(() => {
                    using _guard = logger.metadata({
                        clientId,
                        magnitude,
                        angle,
                    });

                    logger.warn("Invalid magnitude/angle received from client, kicking");
                });

                kickClient(this.waveRoom, client);

                return;
            }

            client.angle = angle;
            client.magnitude = magnitude * 5;
        }
    }

    updateMood(clientId: number, kind: MoodKind) {
        const client = this.clients.get(clientId);
        if (client && !client.isDead) {
            if (
                !MOON_KIND_VALUES.includes(kind)
            ) {
                logger.region(() => {
                    using _guard = logger.metadata({
                        clientId,
                        kind,
                    });

                    logger.warn("Invalid mood kind received from client, kicking");
                });

                kickClient(this.waveRoom, client);

                return;
            }

            client.mood = kind;
        }
    }

    swapPetal(clientId: number, at: number) {
        const client = this.clients.get(clientId);
        if (
            client &&
            !client.isDead &&
            client.slots.surface.length >= at && client.slots.bottom.length >= at &&
            client.slots.bottom[at] instanceof Mob
        ) {
            if (client.slots.surface[at] instanceof Mob) {
                this.removeMob(client.slots.surface[at].id);
            }

            const temp = client.slots.surface[at];
            client.slots.surface[at] = client.slots.bottom[at];
            client.slots.bottom[at] = temp;
        }
    }

    // End

    broadcastUpdatePacket() {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clients.forEach((player) => {
            player.ws.send(updatePacket, true);
        });
    }

    broadcastInitPacket() {
        this.clients.forEach((player, clientId) => {
            const buffer = Buffer.alloc(5);
            let offset = 0;

            buffer.writeUInt8(PacketKind.SELF_ID, offset++);

            buffer.writeUInt32BE(clientId, offset);
            offset += 4;

            player.ws.send(buffer, true);
        });
    }

    private calculateClientsPacketSize(): number {
        // 2 bytes for the client count
        let size = 2;
        this.clients.forEach(client => {
            size += 4 + 8 + 8 + 4 + 4 + 1 + 1 + 1 + client.nickname.length + 1 + 4; // Total bytes per client
        });
        return size;
    }

    private calculateMobsPacketSize(): number {
        // 2 bytes for the mob count
        let size = 2;
        this.mobs.forEach(mob => {
            size += 4 + 8 + 8 + 4 + 4 + 8 + 1 + 1 + 4 + 1; // Total bytes per mob
        });
        return size;
    }

    private createClientsPacket() {
        const size = this.calculateClientsPacketSize();
        const buffer = Buffer.alloc(size);
        let offset = 0;

        // Client count
        buffer.writeUInt16BE(this.clients.size, offset);
        offset += 2;

        this.clients.forEach(client => {
            buffer.writeUInt32BE(client.id, offset);
            offset += 4;

            buffer.writeDoubleBE(client.x, offset);
            offset += 8;
            buffer.writeDoubleBE(client.y, offset);
            offset += 8;

            buffer.writeInt32BE(client.health, offset);
            offset += 4;

            buffer.writeUInt32BE(client.size, offset);
            offset += 4;

            buffer.writeUInt8(client.angle, offset++);

            buffer.writeUInt8(client.mood, offset++);

            buffer.writeUInt8(client.isDead ? 1 : 0, offset++);

            const nicknameBuffer = Buffer.from(client.nickname, 'utf-8');

            buffer.writeUInt8(nicknameBuffer.length, offset++);

            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;

            buffer.writeInt32BE(client.maxHealth, offset);
            offset += 4;
        });

        return buffer;
    }

    private createMobsPacket() {
        const size = this.calculateMobsPacketSize();
        const buffer = Buffer.alloc(size);
        let offset = 0;

        // Mob count
        buffer.writeUInt16BE(this.mobs.size, offset);
        offset += 2;

        this.mobs.forEach(mob => {
            buffer.writeUInt32BE(mob.id, offset);
            offset += 4;

            buffer.writeDoubleBE(mob.x, offset);
            offset += 8;
            buffer.writeDoubleBE(mob.y, offset);
            offset += 8;

            buffer.writeInt32BE(mob.health, offset);
            offset += 4;

            buffer.writeUInt32BE(mob.size, offset);
            offset += 4;

            buffer.writeDoubleBE(mob.angle, offset);
            offset += 8;

            // Make this uint16 when petals & mobs ids above 255
            buffer.writeUInt8(mob.type, offset++);

            buffer.writeUInt8(mob.rarity, offset++);

            buffer.writeInt32BE(mob.maxHealth, offset);
            offset += 4;

            // Is pet or no
            buffer.writeUInt8(mob.petParentPlayer ? 1 : 0, offset++);
        });

        return buffer;
    }

    private createUpdatePacket(): Buffer {
        const clientsPacket = this.createClientsPacket();
        const mobsPacket = this.createMobsPacket();

        const totalLength = 1 + clientsPacket.length + mobsPacket.length;

        const buffer = Buffer.alloc(totalLength);
        let offset = 0;

        buffer.writeUInt8(PacketKind.UPDATE, offset++);

        clientsPacket.copy(buffer, offset);
        offset += clientsPacket.length;

        mobsPacket.copy(buffer, offset);

        return buffer;
    }

    getClient(id: number): PlayerInstance | undefined {
        return this.clients.get(id);
    }

    removeClient(clientId: number) {
        const client = this.clients.get(clientId);
        if (client) {
            this.clients.delete(clientId);

            logger.region(() => {
                using _guard = logger.metadata({ clientId });
                logger.info("Removed player from wave");
            });
        }
    }

    getAllClients() {
        return Array.from(this.clients.values());
    }

    getAllClientIds() {
        return Array.from(this.clients.keys());
    }

    getMob(id: number): MobInstance | undefined {
        return this.mobs.get(id);
    }

    removeMob(id: number) {
        const mob = this.mobs.get(id);
        if (mob) {
            this.mobs.delete(id);
        }
    }

    getAllMobs() {
        return Array.from(this.mobs.values());
    }

    getAllMobIds() {
        return Array.from(this.mobs.keys());
    }
}