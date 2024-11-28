import uWS from 'uWebSockets.js';
import { Mob, MobInstance, MOB_SIZE_FACTOR, MobData } from "../entity/mob/Mob";
import { Player, PlayerInstance, MockPlayerData } from "../entity/player/Player";
import { EntityId, onUpdateTick } from "../entity/Entity";
import { isPetal } from '../utils/common';
import { MOB_PROFILES } from '../../shared/mobProfiles';
import { PETAL_PROFILES } from '../../shared/petalProfiles';
import { isSpawnableSlot, PetalData, MockPetalData, Slot } from '../entity/mob/petal/Petal';
import { USAGE_RELOAD_PETALS } from '../entity/player/PlayerPetalReload';
import { logger } from '../main';
import WaveRoom, { WaveData, WaveRoomPlayer, WaveRoomPlayerId } from './WaveRoom';
import { getRandomMapSafePosition, generateRandomEntityId, getRandomAngle, getRandomPosition } from '../utils/random';
import WaveProbabilityPredictor from './WaveProbabilityPredictor';
import { Biomes, MobType, PetalType, Mood, MOON_VALUES } from '../../shared/enum';
import { Rarities } from '../../shared/rarity';
import { ClientBound } from '../../shared/packet';

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
 * Data such as the overall wave luck and the current wave number are stored in this class.
 * Spawning and other processes are also handled in this class.
 */
export class WavePool {
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

        waveStartBuffer.writeUInt8(ClientBound.WAVE_STARTING, 0);

        waveStartBuffer.writeUInt8(biome, 1);

        roomCandidates.forEach(player => {
            const randPos = getRandomPosition(10000, 10000, this.waveData.waveMapSize);
            if (!randPos) {
                return null;
            }

            this.addClient(player, randPos[0], randPos[1]);

            player.ws.send(waveStartBuffer, true);
        });

        this.broadcastSeldIdPacket();

        this.updateInterval = setInterval(this.updateEntities.bind(this), 1000 / UPDATE_FPS);
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
            playerDeadCameraTargetEntity: null,
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

            petMaster: eggParent,
            petGoingToMaster: false,

            petalIsUsage: USAGE_RELOAD_PETALS.has(type),
            petalMaster: petalParent,
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

    /**
     * Run all entity mixin.
     */
    private updateEntities() {
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
            client.magnitude = magnitude * Player.PLAYER_SPEED;
        }

        return true;
    }

    /**
     * Updates the mood of a client.
     */
    public changeMood(clientId: PlayerInstance["id"], kind: Mood): boolean {
        if (
            !MOON_VALUES.includes(kind)
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

    /**
     * Send chat to specifics user.
     */
    public sendChat(id: PlayerInstance["id"], msg: string) {
        if (this.clients.has(id)) {
            const client = this.clients.get(id);

            const buffer = Buffer.alloc(1 + 1 + msg.length);
            buffer.writeUInt8(ClientBound.CHAT_RECV, 0);

            const msgBuffer = Buffer.from(msg, 'utf-8');
            buffer.writeUInt8(msgBuffer.length, 1);
            msgBuffer.copy(buffer, 2);

            client.ws.send(buffer, true);
        }
    }

    /**
     * Broadcast message.
     */
    public broadcastChat(msg: string) {
        const buffer = Buffer.alloc(1 + 1 + msg.length);
        buffer.writeUInt8(ClientBound.CHAT_RECV, 0);

        const msgBuffer = Buffer.from(msg, 'utf-8');
        buffer.writeUInt8(msgBuffer.length, 1);
        msgBuffer.copy(buffer, 2);

        this.clients.forEach((player) => {
            player.ws.send(buffer, true);
        });
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
        buffer.writeUInt8(ClientBound.SELF_ID, 0);

        // Loop through all WebSocket connections
        this.clients.forEach((player, clientId) => {
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
        buffer.writeUInt8(ClientBound.WAVE_UPDATE, offset++);

        // Wave information
        buffer.writeUInt16BE(this.waveData.waveProgress, offset);
        offset += 2;

        buffer.writeDoubleBE(this.waveData.waveProgressTimer, offset);
        offset += 8;

        buffer.writeDoubleBE(this.waveData.waveProgressRedGageTimer, offset);
        offset += 8;

        buffer.writeUInt8(this.waveData.waveEnded ? 1 : 0, offset++);

        buffer.writeUInt16BE(this.waveData.waveMapSize, offset);
        offset += 2;

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

            buffer.writeUInt8(client.angle, offset++);

            buffer.writeInt32BE(client.health, offset);
            offset += 4;

            buffer.writeInt32BE(client.maxHealth, offset);
            offset += 4;

            buffer.writeUInt32BE(client.size, offset);
            offset += 4;

            buffer.writeUInt8(client.mood, offset++);

            buffer.writeUInt8(client.isDead ? 1 : 0, offset++);

            const nicknameBuffer = Buffer.from(client.nickname, 'utf-8');
            buffer.writeUInt8(nicknameBuffer.length, offset++);
            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;
        });

        // Write mobs
        buffer.writeUInt16BE(this.mobs.size, offset);
        offset += 2;

        this.mobs.forEach(mob => {
            // Id of mob
            buffer.writeUInt32BE(mob.id, offset);
            offset += 4;

            // Coordinate of mob
            buffer.writeDoubleBE(mob.x, offset);
            offset += 8;
            buffer.writeDoubleBE(mob.y, offset);
            offset += 8;

            // Angle of mob
            buffer.writeDoubleBE(mob.angle, offset);
            offset += 8;

            // Health of mob
            buffer.writeInt32BE(mob.health, offset);
            offset += 4;

            // Max health of mob
            buffer.writeInt32BE(mob.maxHealth, offset);
            offset += 4;

            // Size of mob
            buffer.writeUInt32BE(mob.size, offset);
            offset += 4;

            // Type of mob
            buffer.writeUInt8(mob.type, offset++);

            // Rarity of mob
            buffer.writeUInt8(mob.rarity, offset++);

            // Mob is pet, or not
            buffer.writeUInt8(mob.petMaster ? 1 : 0, offset++);
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