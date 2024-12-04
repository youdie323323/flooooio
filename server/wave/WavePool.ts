import { Mob, MobInstance, MOB_SIZE_FACTOR, MobData } from "../entity/mob/Mob";
import { Player, PlayerInstance, MockPlayerData } from "../entity/player/Player";
import { EntityId, onUpdateTick } from "../entity/Entity";
import { calculateMobSize, isPetal, revivePlayer } from '../utils/common';
import { MOB_PROFILES } from '../../shared/mobProfiles';
import { PETAL_PROFILES } from '../../shared/petalProfiles';
import { isSpawnableSlot, PetalData, MockPetalData } from '../entity/mob/petal/Petal';
import { USAGE_RELOAD_PETALS } from '../entity/player/PlayerPetalReload';
import { logger } from '../main';
import { WaveRoomPlayer, WaveRoomPlayerId } from './WaveRoom';
import { generateRandomEntityId, getRandomAngle, getRandomPosition, getRandomSafePosition } from '../utils/random';
import { Biomes, MobType, PetalType, Mood } from '../../shared/enum';
import { Rarities } from '../../shared/rarity';
import { ClientBound } from '../../shared/packet';
import { SAFETY_DISTANCE } from "../entity/EntityMapBoundary";
import WaveProbabilityPredictor, { LINKED_MOBS } from "./WaveProbabilityPredictor";
import { WaveRoomState } from "../../shared/waveRoom";
import { calculateWaveLength } from "../../shared/formula";

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

export const PRE_WAVE_UPDATE_FPS = 30;

export const WAVE_UPDATE_FPS = 60;

/**
 * Frame per second to send update packet.
 * 
 * @remarks
 * 
 * Packets don't need to be sent at 60fps per second. 30fps per second is enough.
 * If update sent too fast, it will feel laggy.
 */
export const WAVE_UPDATE_SEND_FPS = 30;

/**
 * Wave data.
 */
export interface WaveData {
    /**
     * Wave progress (gage).
     */
    waveProgress: number;
    waveProgressTimer: number;
    waveProgressRedGageTimer: number;
    waveProgressIsRedGage: boolean;

    /**
     * Radius of wave.
     */
    waveMapRadius: number;
}

/**
 * Pool of entities, aka wave.
 */
export class WavePool {
    public clientPool: Map<PlayerInstance["id"], PlayerInstance>;
    public mobPool: Map<MobInstance["id"], MobInstance>;

    private eliminatedEntities: EntityId[];

    private waveProbabilityPredictor: WaveProbabilityPredictor;

    private updateWaveInterval: NodeJS.Timeout;
    private updateEntitiesInterval: NodeJS.Timeout;
    private updatePacketSendInterval: NodeJS.Timeout;

    private biome: Biomes;

    /**
     * Current wave data.
     */
    public waveData: WaveData = {
        waveProgress: 52,
        waveProgressTimer: 0,
        waveProgressRedGageTimer: 0,
        waveProgressIsRedGage: false,

        waveMapRadius: 2000,
    };

    constructor(
        private _state: () => WaveRoomState,
        private _onChangeAnything: () => Disposable,
    ) {
        this.clientPool = new Map();
        this.mobPool = new Map();

        this.eliminatedEntities = new Array();

        this.waveProbabilityPredictor = new WaveProbabilityPredictor();
        this.waveProbabilityPredictor.reset(this.waveData.waveProgress);
    }

    /**
     * Release all memory in this class.
     */
    public releaseAllMemory() {
        this.clientPool.forEach((v) => v["dispose"]());
        this.mobPool.forEach((v) => v["dispose"]());

        clearInterval(this.updateWaveInterval);
        clearInterval(this.updateEntitiesInterval);
        clearInterval(this.updatePacketSendInterval);

        this.updateWaveInterval = null;
        this.updateEntitiesInterval = null;
        this.updatePacketSendInterval = null;

        this.clientPool.clear();
        this.mobPool.clear();

        this.clientPool = null;
        this.mobPool = null;

        this.eliminatedEntities = null;

        this.waveProbabilityPredictor = null;

        this.waveData = null;

        this._state = null;
        this._onChangeAnything = null;

        logger.info("Released wave pool memory");
    }

    /**
     * Start wave.
     * @param biome - biome of wave.
     * @param roomCandidates - list of players.
     */
    public startWave(biome: Biomes, roomCandidates: WaveRoomPlayer[]) {
        // Set data (i dont like this code)
        this.biome = biome;

        const waveStartBuffer = Buffer.alloc(2);

        waveStartBuffer.writeUInt8(ClientBound.WAVE_STARTING, 0);
        waveStartBuffer.writeUInt8(biome, 1);

        // Spawn all candidates at random position
        roomCandidates.forEach(player => {
            const randPos = getRandomPosition(this.waveData.waveMapRadius, this.waveData.waveMapRadius, this.waveData.waveMapRadius);

            this.addClient(player, randPos[0], randPos[1]);

            player.ws.send(waveStartBuffer, true);
        });

        // Broadcast self id to all connection
        this.broadcastSeldIdPacket();

        this.updateWaveInterval = setInterval(this.updateWave.bind(this), 1000 / PRE_WAVE_UPDATE_FPS);
        this.updateEntitiesInterval = setInterval(this.updateEntities.bind(this), 1000 / WAVE_UPDATE_FPS);
        this.updatePacketSendInterval = setInterval(this.broadcastUpdatePacket.bind(this), 1000 / WAVE_UPDATE_SEND_FPS);
    }

    public endWave() {
    }

    public addClient(playerData: MockPlayerData, x: number, y: number): PlayerInstance | null {
        const clientId = generateRandomEntityId();

        // Ensure unique clientId
        if (this.clientPool.has(clientId)) {
            return this.addClient(playerData, x, y);
        }

        // 100 is level
        // 100 * x, x is upgrade
        let health: number = (100 * 1) * 1.02 ** (Math.max(100, 75) - 1);

        // Temporary (for debug)
        health *= 10000;

        const playerInstance = new Player({
            id: clientId,
            x,
            y,
            angle: 0,
            magnitude: 0,
            mood: 0,
            size: 15,

            // You should change maxHealth when changed health

            health: health,
            maxHealth: health,

            bodyDamage: 1000,

            isDead: false,

            deadCameraTargetEntity: null,

            nickname: playerData.name,

            slots: {
                surface: null,
                bottom: null,
                cooldownsPetal: [],
                cooldownsUsage: [],
            },

            ws: playerData.ws,
        });

        playerInstance.slots.surface = playerData.slots.surface.map(c => c && !isSpawnableSlot(c) && this.mockPetalDataToReal(c, playerInstance));
        playerInstance.slots.bottom = playerData.slots.bottom.map(c => c && !isSpawnableSlot(c) && this.mockPetalDataToReal(c, playerInstance));

        this.clientPool.set(clientId, playerInstance);

        playerData.ws.getUserData().waveClientId = clientId;

        logger.region(() => {
            using _guard = logger.metadata({ clientId });
            logger.info("Added player on wave");
        });

        return playerInstance;
    }

    public addPetalOrMob(
        type: MobType | PetalType,
        rarity: Rarities,

        x: number,
        y: number,

        petalMaster: PlayerInstance = null,
        petMaster: PlayerInstance = null,

        connectingSegment: MobInstance = null,
        isFirstSegment: boolean = false,
    ): MobInstance | null {
        const mobId = generateRandomEntityId();
        if (this.mobPool.has(mobId)) {
            return this.addPetalOrMob(type, rarity, x, y, petalMaster, petMaster, connectingSegment, isFirstSegment);
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
            size: isPetal(type) ? 6 : calculateMobSize(profile as MobData, rarity),

            // You should change maxHealth when changed health

            health: profile[rarity].health,
            maxHealth: profile[rarity].health,

            mobTargetEntity: null,

            mobLastAttackedBy: null,

            petMaster,
            petGoingToMaster: false,

            petalIsUsage: USAGE_RELOAD_PETALS.has(type),
            petalMaster,
            petalSummonedPet: null,

            starfishRegeningHealth: false,

            connectingSegment,
            isFirstSegment,
        });

        // Add mob to pool
        this.mobPool.set(mobId, mobInstance);

        return mobInstance;
    }

    private mockPetalDataToReal(sp: MockPetalData, parent: PlayerInstance): MobInstance[] | null {
        if (!sp) {
            return null;
        }

        const count: number = PETAL_PROFILES[sp.type][sp.rarity].count;

        let slotPetals: MobInstance[] = new Array(count);

        for (let i = 0; i < count; i++) {
            slotPetals[i] = this.addPetalOrMob(sp.type, sp.rarity, parent.x, parent.y, parent);
        }

        return slotPetals;
    }

    /**
     * Run all entity mixin.
     */
    private updateEntities() {
        this.clientPool.forEach((client) => client[onUpdateTick](this));
        this.mobPool.forEach((mob) => mob[onUpdateTick](this));
    }

    private updateWave() {
        const waveRoomState = this._state();

        if (waveRoomState === WaveRoomState.STARTED) {
            using _disposable = this._onChangeAnything();

            if (!this.waveData.waveProgressIsRedGage) {
                const mobData = this.waveProbabilityPredictor.predictMockData(this.waveData.waveProgress, this.biome);
                if (mobData) {
                    const [type, rarity] = mobData;

                    const randPos = getRandomSafePosition(this.waveData.waveMapRadius, SAFETY_DISTANCE, this.getAllClients().filter(p => !p.isDead));
                    if (!randPos) {
                        return null;
                    }

                    if (LINKED_MOBS.has(type)) {
                        this.createLinkedMob(type, rarity, randPos[0], randPos[1], 10);
                    } else {
                        this.addPetalOrMob(type, rarity, randPos[0], randPos[1]);
                    }
                }
            }

            const waveLength = calculateWaveLength(this.waveData.waveProgress);

            if (this.waveData.waveProgressTimer >= waveLength) {
                // If mob count above 4, start red gage
                if (
                    // Force start into next wave when red gage reached
                    !(this.waveData.waveProgressRedGageTimer >= waveLength) &&
                    4 < this.getAllMobs().filter(c => /** Dont count petals & pets. */ !c.petMaster && !c.petalMaster).length
                ) {
                    this.waveData.waveProgressIsRedGage = true;

                    this.waveData.waveProgressRedGageTimer = Math.min(waveLength, Math.round((this.waveData.waveProgressRedGageTimer + 0.016) * 10000) / 10000);
                } else {
                    // Respawn all dead players
                    this.clientPool.forEach(c => revivePlayer(this, c));

                    this.waveData.waveProgressIsRedGage = false;

                    this.waveData.waveProgressRedGageTimer = 0;

                    this.waveData.waveProgressTimer = 0;

                    this.waveData.waveProgress++;

                    this.waveProbabilityPredictor.reset(this.waveData.waveProgress);
                }
            } else {
                this.waveData.waveProgressTimer = Math.min(waveLength, Math.round((this.waveData.waveProgressTimer + 0.016) * 10000) / 10000);
            }
        }
    }

    public createLinkedMob(
        type: MobType,
        rarity: Rarities,
        x: number,
        y: number,

        bodyCount: number,
    ) {
        const profile: MobData = MOB_PROFILES[type];

        const distanceBetween = (profile.rx + profile.ry) * (calculateMobSize(profile, rarity) / profile.fraction);

        let prevSegment: MobInstance = null;

        for (let i = 0; i < bodyCount + 1; i++) {
            const radius = i * distanceBetween;

            prevSegment = this.addPetalOrMob(
                type,
                rarity,

                // This is fucking important, dont use same coordinate every segment,
                // i wasted 3 hours here, maybe this is because of collision
                x + radius,
                y + radius,

                null,
                null,

                prevSegment,
                // Head
                i === 0,
            );
        }
    }

    /**
     * Updates the movement of a client
     */
    public updateMovement(clientId: PlayerInstance["id"], angle: number, magnitude: number) {
        // Uint8 always range to 0 ~ 255, so no need to check this
        // if (
        //     magnitude < 0 || magnitude > 255 ||
        //     angle < 0 || angle > 256
        // ) {
        //     return false;
        // }

        const client = this.clientPool.get(clientId);
        if (client && !client.isDead) {
            client.angle = angle;
            client.magnitude = magnitude * Player.BASE_SPEED;
        }
    }

    /**
     * Updates the mood of a client.
     */
    public changeMood(clientId: PlayerInstance["id"], kind: Mood) {
        const client = this.clientPool.get(clientId);
        if (client && !client.isDead) {
            client.mood = kind;
        }
    }

    /**
     * Swaps a petal between surface and bottom slots for a client.
     */
    public swapPetal(clientId: PlayerInstance["id"], at: number) {
        const client = this.clientPool.get(clientId);
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
     * Broadcast message.
     */
    public broadcastChat(calleeId: PlayerInstance["id"], msg: string) {
        const buffer = Buffer.alloc(1 + 4 + (1 + msg.length));
        buffer.writeUInt8(ClientBound.WAVE_CHAT_RECV, 0);

        buffer.writeUInt32BE(calleeId, 1);

        const msgBuffer = Buffer.from(msg, 'utf-8');
        buffer.writeUInt8(msgBuffer.length, 5);
        msgBuffer.copy(buffer, 6);

        this.clientPool.forEach((player) => {
            player.ws.send(buffer, true);
        });
    }

    private broadcastUpdatePacket() {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clientPool.forEach((player) => {
            player.ws.send(updatePacket, true);
        });
    }

    private broadcastSeldIdPacket() {
        // Reuse buffer
        const buffer = Buffer.alloc(5);
        buffer.writeUInt8(ClientBound.WAVE_SELF_ID, 0);

        // Loop through all WebSocket connections
        this.clientPool.forEach((player, clientId) => {
            buffer.writeUInt32BE(clientId, 1);

            player.ws.send(buffer, true);
        });
    }

    private calculateTotalPacketSize(): number {
        // Base size for wave data and packet kind
        let size = 1 + 2 + 8 + 8 + 2 + 1;

        // Add size for clients
        // Client count
        size += 2;
        this.clientPool.forEach(client => {
            // String length is is dynamically changeable, so we can do is just loop
            size += 4 + 8 + 8 + 1 + 4 + 4 + 4 + 1 + (1 + client.nickname.length) + 1;
        });

        // Add size for mobs
        // Mob count
        size += 2;
        size += this.mobPool.size * (4 + 8 + 8 + 8 + 4 + 4 + 4 + 1 + 1 + 1)

        // Add size for eliminated entities
        // Eliminated entity count
        size += 2;
        size += this.eliminatedEntities.length * 4;

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

        const waveRoomState = this._state();
        // Wave is game over or not
        buffer.writeUInt8(waveRoomState === WaveRoomState.ENDED ? 1 : 0, offset++);

        // Radius of map
        buffer.writeUInt16BE(this.waveData.waveMapRadius, offset);
        offset += 2;

        // Write clients
        buffer.writeUInt16BE(this.clientPool.size, offset);
        offset += 2;

        this.clientPool.forEach(client => {
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

            const nicknameBuffer = Buffer.from(client.nickname, 'utf-8');
            buffer.writeUInt8(nicknameBuffer.length, offset++);
            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;

            // Write boolean flags
            const bFlags = (client.isDead ? 1 : 0);
            buffer.writeUInt8(bFlags, offset++);
        });

        // Write mobs
        buffer.writeUInt16BE(this.mobPool.size, offset);
        offset += 2;

        this.mobPool.forEach(mob => {
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

            // Write boolean flags
            const bFlags =
                // Mob is pet, or not
                (mob.petMaster ? 1 : 0) |
                // Mob is first segment, or not
                (mob.isFirstSegment ? 2 : 0);
            buffer.writeUInt8(bFlags, offset++);
        });

        // Write eliminated entities
        buffer.writeUInt16BE(this.eliminatedEntities.length, offset);
        offset += 2;

        if (this.eliminatedEntities.length) {
            this.eliminatedEntities.forEach((id) => {
                // Id of entity
                buffer.writeUInt32BE(id, offset);
                offset += 4;
            });

            // Delete eliminated entities per packet send
            this.eliminatedEntities.length = 0;
        }

        return buffer;
    }

    getClient(clientId: PlayerInstance["id"]): PlayerInstance | undefined {
        return this.clientPool.get(clientId);
    }

    removeClient(clientId: PlayerInstance["id"]) {
        const client = this.getClient(clientId);
        if (client) {
            // Free memory
            client["dispose"]();

            this.clientPool.delete(clientId);

            this.eliminatedEntities.push(clientId);

            logger.region(() => {
                using _guard = logger.metadata({ clientId });
                logger.info("Removed player from wave");
            });
        }
    }

    getAllClients() {
        return Array.from(this.clientPool.values());
    }

    getAllClientIds() {
        return Array.from(this.clientPool.keys());
    }

    getMob(mobId: MobInstance["id"]): MobInstance | undefined {
        return this.mobPool.get(mobId);
    }

    removeMob(mobId: MobInstance["id"]) {
        const mob = this.getMob(mobId);
        if (mob) {
            // Free memory
            mob["dispose"]();

            this.mobPool.delete(mobId);

            this.eliminatedEntities.push(mobId);
        }
    }

    getAllMobs() {
        return Array.from(this.mobPool.values());
    }

    getAllMobIds() {
        return Array.from(this.mobPool.keys());
    }
}