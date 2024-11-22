import uWS from 'uWebSockets.js';
import { PacketKind } from "../../shared/packet";
import { MobType, PetalType } from "../../shared/types";
import { Mob, MobInstance, MOB_SIZE_FACTOR, MobData } from "./mob/Mob";
import { Player, PlayerInstance, MockPlayerData } from "./player/Player";
import { EntityId, onUpdateTick } from "./Entity";
import { isPetal, kickClient } from '../utils/common';
import { Rarities } from '../../shared/rarities';
import { MAP_CENTER_X, MAP_CENTER_Y, SAFETY_DISTANCE } from './EntityChecksum';
import { MOB_PROFILES } from '../../shared/mobProfiles';
import { PETAL_PROFILES } from '../../shared/petalProfiles';
import { isSpawnableSlot, PetalData, MockPetalData, Slot } from './mob/petal/Petal';
import { USAGE_RELOAD_PETALS } from './player/PlayerReload';
import { MoodKind, MOON_KIND_VALUES } from '../../shared/mood';
import { logger } from '../main';
import WaveRoom, { WaveData, WaveRoomPlayer, WaveRoomPlayerId, WaveRoomState } from '../wave/WaveRoom';
import { getRandomMapSafePosition, generateRandomEntityId, getRandomAngle } from '../utils/random';
import WaveProbabilityPredictor from '../wave/WaveProbabilityPredictor';
import { Biomes } from '../../shared/biomes';

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
    wavePlayerData: MockPlayerData;
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
 * R̶a̶t̶h̶e̶r̶ ̶t̶h̶a̶n̶ ̶d̶o̶i̶n̶g̶ ̶u̶n̶n̶e̶c̶e̶s̶s̶a̶r̶y̶ ̶p̶r̶o̶c̶e̶s̶s̶i̶n̶g̶ ̶l̶i̶k̶e̶ ̶s̶p̶a̶w̶n̶i̶n̶g̶ ̶m̶o̶b̶s̶ ̶h̶e̶r̶e̶,̶ ̶i̶t̶'̶s̶ ̶b̶e̶t̶t̶e̶r̶ ̶t̶o̶ ̶d̶o̶ ̶t̶h̶a̶t̶ ̶i̶n̶ ̶W̶a̶v̶e̶R̶o̶o̶m̶.̶
 * T̶h̶i̶s̶ ̶c̶l̶a̶s̶s̶ ̶i̶s̶ ̶o̶n̶l̶y̶ ̶f̶o̶r̶ ̶m̶a̶n̶a̶g̶i̶n̶g̶ ̶m̶o̶b̶s̶ ̶a̶n̶d̶ ̶p̶l̶a̶y̶e̶r̶s̶,̶ ̶n̶o̶t̶ ̶f̶o̶r̶ ̶r̶a̶n̶d̶o̶m̶l̶y̶ ̶s̶p̶a̶w̶n̶i̶n̶g̶ ̶m̶o̶b̶s̶ ̶e̶t̶c̶.̶
 * Data such as the overall wave luck and the current wave number are stored in this class.
 * Spawning and other processes are also handled in this class.
 */
export class EntityPool {
    public clients: Map<PlayerInstance["id"], PlayerInstance>;
    public mobs: Map<MobInstance["id"], MobInstance>;

    private updateInterval: NodeJS.Timeout;
    private updateSendInterval: NodeJS.Timeout;

    /**
     * @param waveData - POSSIBLY CIRCULAR REFERENCE. TODO: FIX
     */
    constructor(public waveData: WaveData) {
        this.clients = new Map();
        this.mobs = new Map();
    }

    /**
     * Release all memory in this class.
     */
    public releaseAllMemory() {
        clearInterval(this.updateInterval);
        clearInterval(this.updateSendInterval);

        this.updateInterval = null;
        this.updateSendInterval = null;

        this.clients.forEach((v) => {
            if (v["free"]) {
                v["free"]();
            }
        });

        this.mobs.forEach((v) => {
            if (v["free"]) {
                v["free"]();
            }
        });

        this.clients.clear();
        this.mobs.clear();

        this.clients = null;
        this.mobs = null;

        this.waveData = null;
    }

    /**
     * Start wave.
     * @param biome - biome of wave.
     * @param roomCandidates - list of players.
     */
    public startWave(biome: Biomes, roomCandidates: WaveRoomPlayer[]) {
        const waveStartBuffer = Buffer.alloc(2);

        waveStartBuffer.writeUInt8(PacketKind.WAVE_ROOM_STARTING, 0);

        waveStartBuffer.writeUInt8(biome, 1);

        roomCandidates.forEach(player => {
            const randPos = getRandomMapSafePosition(MAP_CENTER_X, MAP_CENTER_Y, this.waveData.mapSize, SAFETY_DISTANCE, this.getAllClients().filter(p => !p.isDead));
            if (!randPos) {
                return null;
            }

            this.addClient(player, randPos[0], randPos[1]);

            player.ws.send(waveStartBuffer, true);
        });

        this.broadcastSeldIdPacket();

        this.updateInterval = setInterval(this.update.bind(this), 1000 / UPDATE_FPS);
        this.updateSendInterval = setInterval(this.broadcastUpdatePacket.bind(this), 1000 / UPDATE_SEND_FPS);
    }

    public endWave() {
    }

    public addClient(playerData: MockPlayerData, x: number, y: number): PlayerInstance | null {
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
            playerCameraTargetEntity: null,
            nickname: playerData.name,
            ws: playerData.ws,
            slots: {
                surface: null,
                bottom: null,
                cooldownsPetal: [],
                cooldownsUsage: [],
            },
        });

        playerInstance.slots.surface = playerData.slots.surface.map(c => c && !isSpawnableSlot(c) && this.mockPetalDataToReal(c, playerInstance));
        playerInstance.slots.bottom = playerData.slots.bottom.map(c => c && !isSpawnableSlot(c) && this.mockPetalDataToReal(c, playerInstance));

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
            size: isPetal(type) ? 6 : (profile as MobData).baseSize * MOB_SIZE_FACTOR[rarity],
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

    private mockPetalDataToReal(sp: MockPetalData, parent: PlayerInstance): MobInstance[] | null {
        if (!sp) {
            return null;
        }

        const count: number = PETAL_PROFILES[sp.type][sp.rarity].count;

        let slotPetals: MobInstance[] = new Array(count);

        for (let i = 0; i < count; i++) {
            slotPetals[i] = this.addPetalOrMob(sp.type, sp.rarity, parent.x, parent.y, parent, parent);
        }

        return slotPetals;
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
    }

    /**
     * Updates the movement of a client
     */
    public updateMovement(clientId: PlayerInstance["id"], angle: number, magnitude: number): boolean {
        if (
            magnitude < 0 || magnitude > 255 ||
            angle < 0 || angle > 256
        ) {
            return false;
        }

        const client = this.clients.get(clientId);
        if (client && !client.isDead) {
            client.angle = angle;
            client.magnitude = magnitude * 5;
        }

        return true;
    }

    /**
     * Updates the mood of a client.
     */
    public changeMood(clientId: PlayerInstance["id"], kind: MoodKind): boolean {
        if (
            !MOON_KIND_VALUES.includes(kind)
        ) {
            return false;
        }

        const client = this.clients.get(clientId);
        if (client && !client.isDead) {
            client.mood = kind;
        }

        return true;
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

    private broadcastUpdatePacket() {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clients.forEach((player) => {
            player.ws.send(updatePacket, true);
        });
    }

    private broadcastSeldIdPacket() {
        // Reuse buffer
        const buffer = Buffer.alloc(5);

        // Loop through all WebSocket connections
        this.clients.forEach((player, clientId) => {
            buffer.writeUInt8(PacketKind.SELF_ID, 0);
            buffer.writeUInt32BE(clientId, 1);

            player.ws.send(buffer, true);
        });
    }

    private calculateTotalPacketSize(): number {
        // Base size for wave data and packet kind
        let size = 1 + 2 + 8 + 8 + 2 + 1;

        // Add size for clients
        size += 2; // Client count
        this.clients.forEach(client => {
            size += 4 + 8 + 8 + 4 + 4 + 1 + 1 + 1 + client.nickname.length + 1 + 4;
        });

        // Add size for mobs
        size += 2; // Mob count
        this.mobs.forEach(mob => {
            size += 4 + 8 + 8 + 4 + 4 + 8 + 1 + 1 + 4 + 1;
        });

        return size;
    }

    private createUpdatePacket(): Buffer {
        const buffer = Buffer.alloc(this.calculateTotalPacketSize());
        let offset = 0;

        // Packet kind
        buffer.writeUInt8(PacketKind.UPDATE, offset++);

        // Wave information
        buffer.writeUInt16BE(this.waveData.waveProgress, offset);
        offset += 2;

        buffer.writeDoubleBE(this.waveData.waveProgressTimer, offset);
        offset += 8;

        buffer.writeDoubleBE(this.waveData.waveProgressRedGageTimer, offset);
        offset += 8;

        buffer.writeUInt16BE(this.waveData.mapSize, offset);
        offset += 2;

        buffer.writeUInt8(this.waveData.waveEnded ? 1 : 0, offset++);

        // Write clients
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

        // Write mobs
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

            buffer.writeUInt8(mob.type, offset++);

            buffer.writeUInt8(mob.rarity, offset++);

            buffer.writeInt32BE(mob.maxHealth, offset);
            offset += 4;

            buffer.writeUInt8(mob.petParentPlayer ? 1 : 0, offset++);
        });

        return buffer;
    }

    getClient(clientId: PlayerInstance["id"]): PlayerInstance | undefined {
        return this.clients.get(clientId);
    }

    removeClient(clientId: PlayerInstance["id"]) {
        if (this.clients.has(clientId)) {
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
        if (this.mobs.has(mobId)) {
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