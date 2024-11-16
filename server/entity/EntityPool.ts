import uWS from 'uWebSockets.js';
import { PacketKind } from "../../shared/packet";
import { MobType, PetalType } from "../../shared/types";
import { Mob, MobInstance, MOB_SIZE_FACTOR, MobData } from "./mob/Mob";
import { Player, PlayerInstance, StaticPlayerData } from "./player/Player";
import { EntityId, onUpdateTick } from "./Entity";
import { isPetal, kickClient } from './utils/common';
import { Rarities } from '../../shared/rarities';
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from './EntityChecksum';
import { MOB_PROFILES } from '../../shared/mobProfiles';
import { PETAL_PROFILES } from '../../shared/petalProfiles';
import { isLivingPetal, PetalData, StaticPetalData } from './mob/petal/Petal';
import { USAGE_RELOAD_PETALS } from './player/PlayerReload';
import { MoodKind, MOON_KIND_VALUES } from '../../shared/mood';
import { logger } from '../main';
import WaveRoom, { WaveRoomPlayerId } from '../wave/WaveRoom';
import { getRandomSafePosition, generateRandomEntityId, getRandomAngle } from './utils/random';
import { calculateWaveLength, calculateWaveLuck } from './utils/formula';
import EntitySpawnRandomizer from './EntitySpawnRandomizer';

// Define UserData for WebSocket connections
export interface UserData {
    waveRoomClientId: WaveRoomPlayerId;
    waveClientId: EntityId;
    
    /**
     * Static data of player.
     * 
     * @remarks
     * 
     * This data is used to squad ui to display petals and names and to convert them when wave starting.
     */
    wavePlayerData: StaticPlayerData;
}

export const UPDATE_FPS = 60;

/**
 * Frame per second to send update packet.
 * 
 * @remarks
 * 
 * Packets don't need to be sent at 60fps per second. 30fps per second is enough.
 * If update sent too fast, it will feel laggy.
 */
export const UPDATE_SEND_FPS = 30;

/**
 * Pool of entities, aka wave.
 * 
 * @remarks
 * 
 *  ̶R̶a̶t̶h̶e̶r̶ ̶t̶h̶a̶n̶ ̶d̶o̶i̶n̶g̶ ̶u̶n̶n̶e̶c̶e̶s̶s̶a̶r̶y̶ ̶p̶r̶o̶c̶e̶s̶s̶i̶n̶g̶ ̶l̶i̶k̶e̶ ̶s̶p̶a̶w̶n̶i̶n̶g̶ ̶m̶o̶b̶s̶ ̶h̶e̶r̶e̶,̶ ̶i̶t̶'̶s̶ ̶b̶e̶t̶t̶e̶r̶ ̶t̶o̶ ̶d̶o̶ ̶t̶h̶a̶t̶ ̶i̶n̶ ̶W̶a̶v̶e̶R̶o̶o̶m̶.̶
 *  ̶T̶h̶i̶s̶ ̶c̶l̶a̶s̶s̶ ̶i̶s̶ ̶o̶n̶l̶y̶ ̶f̶o̶r̶ ̶m̶a̶n̶a̶g̶i̶n̶g̶ ̶m̶o̶b̶s̶ ̶a̶n̶d̶ ̶p̶l̶a̶y̶e̶r̶s̶,̶ ̶n̶o̶t̶ ̶f̶o̶r̶ ̶r̶a̶n̶d̶o̶m̶l̶y̶ ̶s̶p̶a̶w̶n̶i̶n̶g̶ ̶m̶o̶b̶s̶ ̶e̶t̶c̶.̶
 * Data such as the overall wave luck and the current wave number are stored in this class.
 * Spawning and other processes are also handled in this class.
 */
export class EntityPool {
    public clients: Map<PlayerInstance["id"], PlayerInstance>;
    public mobs: Map<MobInstance["id"], MobInstance>;

    private updateInterval: NodeJS.Timeout;
    private updateSendInterval: NodeJS.Timeout;

    //  ̶T̶h̶i̶s̶ ̶c̶l̶a̶s̶s̶ ̶m̶e̶t̶h̶o̶d̶s̶ ̶s̶h̶o̶u̶l̶d̶n̶'̶t̶ ̶b̶e̶ ̶c̶a̶l̶l̶e̶d̶ ̶a̶s̶ ̶w̶a̶v̶e̶,̶ ̶b̶u̶t̶ ̶a̶l̶r̶i̶g̶h̶t̶

    /**
     * Current wave progress.
     */
    public waveProgress: number;
    public waveProgressTimer: number;
    public waveProgressRedGageTimer: number;
    public waveProgressIsRedGage: boolean;

    private entitySpawnRandomizer: EntitySpawnRandomizer;

    constructor(private readonly waveRoom: WaveRoom) {
        this.clients = new Map();
        this.mobs = new Map();

        this.waveProgress = 36;
        this.waveProgressTimer = 0;
        this.waveProgressRedGageTimer = 0;
        this.waveProgressIsRedGage = false;

        this.entitySpawnRandomizer = new EntitySpawnRandomizer(this);
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

            this.addClient(player, randPos[0], randPos[1]);

            player.ws.send(waveStartBuffer, true);
        });

        this.broadcastInitPacket();

        this.updateInterval = setInterval(this.update.bind(this), 1000 / UPDATE_FPS);
        this.updateSendInterval = setInterval(this.broadcastUpdatePacket.bind(this), 1000 / UPDATE_SEND_FPS);
    }

    public endWave() {
        clearInterval(this.updateInterval);
        clearInterval(this.updateSendInterval);
    }

    public addClient(playerData: StaticPlayerData, x: number, y: number): PlayerInstance | null {
        const clientId = generateRandomEntityId();

        // Ensure unique clientId
        if (this.clients.has(clientId)) {
            return this.addClient(playerData, x, y);
        }

        // 100 is level
        // 100 * x, x is upgrade
        let health: number = (100 * 1) * 1.02 ** (Math.max(100, 75) - 1);

        // Temporary
        health *= 100;

        const playerInstance = new Player({
            id: clientId,
            x,
            y,
            angle: 0,
            magnitude: 0,
            mood: 0,
            size: 15,
            health: health,
            // Not changing
            maxHealth: health,

            bodyDamage: 1000,
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

        playerInstance.slots.surface = playerData.slots.surface.map(c => c && !isLivingPetal(c) && this.staticPetalDataToReal(c, playerInstance));
        playerInstance.slots.bottom = playerData.slots.bottom.map(c => c && !isLivingPetal(c) && this.staticPetalDataToReal(c, playerInstance));

        this.clients.set(clientId, playerInstance);

        playerData.ws.getUserData().waveClientId = clientId;

        logger.region(() => {
            using _guard = logger.metadata({ clientId });
            logger.info("Added player on wave");
        });

        return playerInstance;
    }

    public addPetalOrMob(type: MobType | PetalType, rarity: Rarities, x: number, y: number, petalParent: PlayerInstance = null, eggParent: PlayerInstance = null): MobInstance | null {
        const mobId = generateRandomEntityId();
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

            petParentPlayer: eggParent,
            petGoingToPlayer: false,

            petalIsUsage: USAGE_RELOAD_PETALS.has(type),
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

        return this.addPetalOrMob(sp.type, sp.rarity, randPos[0], randPos[1], parent, parent);
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

        this.entitySpawnRandomizer[onUpdateTick]();

        // Wave updates

        const waveLength = calculateWaveLength(this.waveProgress);

        if (this.waveProgressTimer >= waveLength) {
            // If mob count above 4, start red gage
            if (
                // Force start into next wave when red gage reached
                !(this.waveProgressRedGageTimer >= waveLength) &&
                4 < this.getAllMobs().filter(c => /** Dont count petals & pets. */ !c.petParentPlayer && !c.petalParentPlayer).length
            ) {
                this.waveProgressIsRedGage = true;

                this.waveProgressRedGageTimer = Math.round((this.waveProgressRedGageTimer + (1 / waveLength)) * 100000) / 100000;
            } else {
                this.waveProgressIsRedGage = false;

                this.waveProgressRedGageTimer = 0;
                
                this.waveProgressTimer = 0;

                this.waveProgress++;

                this.entitySpawnRandomizer.reset();
            }
        } else {
            this.waveProgressTimer = Math.round((this.waveProgressTimer + (1 / waveLength)) * 100000) / 100000;
        }
    }

    /**
     * Updates the movement of a client
     */
    public updateMovement(clientId: PlayerInstance["id"], angle: number, magnitude: number) {
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

    /**
     * Updates the mood of a client.
     */
    public changeMood(clientId: PlayerInstance["id"], kind: MoodKind) {
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

    /**
     * Swaps a petal between surface and bottom slots for a client.
     */
    public swapPetal(clientId: PlayerInstance["id"], at: number) {
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

    broadcastUpdatePacket() {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clients.forEach((player) => {
            player.ws.send(updatePacket, true);
        });
    }

    broadcastInitPacket() {
        const buffer = Buffer.alloc(5);

        this.clients.forEach((player, clientId) => {
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

        const totalLength = (1 + 2 + 1 + 8 + 8) + clientsPacket.length + mobsPacket.length;

        const buffer = Buffer.alloc(totalLength);
        let offset = 0;

        buffer.writeUInt8(PacketKind.UPDATE, offset++);

        // Wave informations
        {
            buffer.writeUInt16BE(this.waveProgress, offset);
            offset += 2;

            buffer.writeUInt8(this.waveProgressIsRedGage ? 1 : 0, offset++);

            buffer.writeDoubleBE(this.waveProgressTimer, offset);
            offset += 8;

            buffer.writeDoubleBE(this.waveProgressRedGageTimer, offset);
            offset += 8;
        }

        clientsPacket.copy(buffer, offset);
        offset += clientsPacket.length;

        mobsPacket.copy(buffer, offset);

        return buffer;
    }

    getClient(clientId: PlayerInstance["id"]): PlayerInstance | undefined {
        return this.clients.get(clientId);
    }

    removeClient(clientId: PlayerInstance["id"]) {
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

    getMob(mobId: MobInstance["id"]): MobInstance | undefined {
        return this.mobs.get(mobId);
    }

    removeMob(mobId: MobInstance["id"]) {
        const mob = this.mobs.get(mobId);
        if (mob) {
            this.mobs.delete(mobId);
        }
    }

    getAllMobs() {
        return Array.from(this.mobs.values());
    }

    getAllMobIds() {
        return Array.from(this.mobs.keys());
    }
}