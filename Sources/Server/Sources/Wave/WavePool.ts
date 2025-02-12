import { calculateWaveLength } from "../../../Shared/formula";
import { ClientBound } from "../../../Shared/packet";
import { PETAL_PROFILES } from "../../../Shared/Entity/Mob/Petal/petalProfiles";
import { Rarity } from "../../../Shared/rarity";
import { WaveRoomState } from "../../../Shared/WaveRoom";
import { logger } from "../../main";
import { Entity, onUpdateTick } from "../Entity/Entity";
import { SAFETY_DISTANCE } from "../Entity/EntityMapBoundary";
import { MobInstance, MobData, Mob, MobId } from "../Entity/Mob/Mob";
import { isLivingSlot, PetalData, MockPetalData, Slot, ClusterLike } from "../Entity/Mob/Petal/Petal";
import { MockPlayerData, PlayerInstance, Player, PlayerId } from "../Entity/Player/Player";
import { PETAL_INITIAL_COOLDOWN } from "../Entity/Player/PlayerPetalReload";
import { isPetal, calculateMobSize, revivePlayer } from "../Utils/common";
import { getRandomPosition, generateRandomId, getRandomAngle, getRandomSafePosition } from "../Utils/random";
import WaveProbabilityDeterminer, { LINKABLE_MOBS } from "./WaveProbabilityDeterminer";
import { WaveRoomPlayerId, WaveRoomPlayer } from "./WaveRoom";
import { MOB_PROFILES } from "../../../Shared/Entity/Mob/mobProfiles";
import { MoodFlags } from "../../../Shared/mood";
import { Biome } from "../../../Shared/biome";
import { MobType, PetalType } from "../../../Shared/EntityType";
import SpatialHash from "../Utils/SpatialHash";
import { MAX_CLUSTER_AMOUNT } from "../Entity/Player/PlayerPetalOrbit";

// Define UserData for WebSocket connections
export interface UserData {
    waveRoomClientId: WaveRoomPlayerId;
    waveClientId: PlayerId;

    /**
     * Static data of player.
     * 
     * @remarks
     * 
     * This data is used to squad ui to display petals and names and to convert them when wave starting.
     */
    wavePlayerData: MockPlayerData;
}

export const UPDATE_WAVE_FPS = 30;

export const UPDATE_ENTITIES_FPS = 60;

/**
 * Frame per second to send update packet.
 * 
 * @remarks
 * 
 * Packets don't need to be sent at 60fps per second. 30fps per second is enough.
 * If update sent too fast, it will feel laggy.
 */
export const UPDATE_PACKET_SEND_FPS = 33;

/**
 * Interface that represents dynamically changable live wave data.
 */
export interface WaveData {
    /**
     * Progress of wave.
     */
    progress: number;
    progressTimer: number;
    progressRedTimer: number;
    progressIsRed: boolean;

    /**
     * Radius of wave map.
     */
    mapRadius: number;

    /**
     * Biome of wave.
     */
    biome: Biome;
}

/**
 * Pool of entities, aka wave.
 */
export class WavePool {
    public clientPool: Map<PlayerInstance["id"], PlayerInstance>;
    public mobPool: Map<MobInstance["id"], MobInstance>;

    private eliminatedEntities: Set<MobInstance["id"] | PlayerInstance["id"]>;

    private waveProbabilityDeterminer: WaveProbabilityDeterminer;

    private updateWaveInterval: NodeJS.Timeout;
    private updateEntitiesInterval: NodeJS.Timeout;
    private updatePacketSendInterval: NodeJS.Timeout;

    private static readonly SPATIAL_HASH_GRID_SIZE = 1024;

    /**
     * Shared spatial hash instance between entities.
     */
    public sharedSpatialHash: SpatialHash<Entity>;

    constructor(
        public waveData: WaveData,

        // What the fuck is this code
        private _state: () => WaveRoomState,
        private _onChangeAnything: () => Disposable,
    ) {
        this.clientPool = new Map();
        this.mobPool = new Map();

        this.eliminatedEntities = new Set();

        this.waveProbabilityDeterminer = new WaveProbabilityDeterminer();
        this.waveProbabilityDeterminer.next(this.waveData);

        this.sharedSpatialHash = new SpatialHash<Entity>(WavePool.SPATIAL_HASH_GRID_SIZE);
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

        this.waveProbabilityDeterminer = null;

        this.waveData = null;

        this.sharedSpatialHash.reset();
        this.sharedSpatialHash = null;

        this._state = null;
        this._onChangeAnything = null;

        logger.info("Released wave pool memory");
    }

    /**
     * Start wave.
     * @param biome - Biome of wave.
     * @param roomCandidates - List of players.
     */
    public startWave(roomCandidates: WaveRoomPlayer[]) {
        const waveStartBuffer = Buffer.alloc(2);

        waveStartBuffer.writeUInt8(ClientBound.WaveStarting, 0);
        waveStartBuffer.writeUInt8(this.waveData.biome, 1);

        // Spawn all candidates at random position
        roomCandidates.forEach(player => {
            const randPos = getRandomPosition(this.waveData.mapRadius, this.waveData.mapRadius, this.waveData.mapRadius);

            const client = this.generateClient(player, randPos[0], randPos[1]);

            player.ws.send(waveStartBuffer, true);

            player.ws.getUserData().waveClientId = client.id;

            logger.region(() => {
                using _guard = logger.metadata({ clientId: client.id });
                logger.info("Added player on wave");
            });
        });

        // Broadcast self id to all connection
        this.broadcastSeldIdPacket();

        // Start all intervaler
        this.updateWaveInterval = setInterval(this.updateWave.bind(this), 1000 / UPDATE_WAVE_FPS);
        this.updateEntitiesInterval = setInterval(this.updateEntities.bind(this), 1000 / UPDATE_ENTITIES_FPS);
        this.updatePacketSendInterval = setInterval(this.broadcastUpdatePacket.bind(this), 1000 / UPDATE_PACKET_SEND_FPS);
    }

    public endWave() {
    }

    /**
     * Generates a player.
     * 
     * @remarks
     * 
     * Although no need to implement isLiving parameter because theres no dummy players.
     * 
     * @param clientData - Mock data of player.
     * 
     * @param x - X coordinate of mob.
     * @param y - Y coordinate of mob.
     * 
     * @returns Instance of player.
     */
    public generateClient(
        clientData: MockPlayerData,

        x: number,
        y: number
    ): PlayerInstance {
        const clientId = generateRandomId<PlayerId>();

        // Ensure unique clientId
        if (this.clientPool.has(clientId)) {
            return this.generateClient(
                clientData,

                x,
                y
            );
        }

        const playerInstance = new Player({
            x,
            y,
            angle: 0,
            magnitude: 0,
            mood: MoodFlags.Normal,
            size: Player.BASE_SIZE,

            id: clientId,

            // Max health
            health: 1,

            bodyDamage: 1000,

            isDead: false,

            deadCameraTargetEntity: null,

            noclip: false,

            nickname: clientData.name,

            slots: {
                surface: null,
                bottom: null,

                cooldownsPetal: Array.from({ length: clientData.slots.surface.length }, e => new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN)),
                cooldownsUsage: Array.from({ length: clientData.slots.surface.length }, e => new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN)),
            },

            ws: clientData.ws,

            isDev: false,
        });

        // Reload all
        playerInstance.slots.surface = clientData.slots.surface.map(c =>
            // Ensure c is MockPetalData
            c &&
            !isLivingSlot(c) &&
            this.mockPetalDataToReal(c, playerInstance, true)
        );
        playerInstance.slots.bottom = clientData.slots.bottom.map(c =>
            c &&
            !isLivingSlot(c) &&
            this.mockPetalDataToReal(c, playerInstance, false)
        );

        // Add client to pool
        this.clientPool.set(clientId, playerInstance);

        // Add to spatial hash
        this.sharedSpatialHash.put(playerInstance);

        return playerInstance;
    }

    /**
     * Generates a mob.
     * 
     * @remarks
     * 
     * This is also used to generate petals.
     * 
     * @param type - Type of mob.
     * @param rarity - Rarity of mob.
     * 
     * @param x - X coordinate of mob.
     * @param y - Y coordinate of mob.
     * 
     * @param petalMaster - Master of petal.
     * @param petMaster - Master of pet.
     * 
     * @param connectingSegment - Connecting mob segment.
     * @param isFirstSegment - Mob to generate is first segment (like centi head).
     * 
     * @param isLiving - Should add to pool (living) or not. This will used for just creating dummy instance.
     * 
     * @returns Instance of mob.
     */
    public generateMob(
        type: MobType | PetalType,
        rarity: Rarity,

        x: number,
        y: number,

        petalMaster: PlayerInstance = null,
        petMaster: PlayerInstance = null,

        connectingSegment: MobInstance = null,
        isFirstSegment: boolean = false,

        isLiving: boolean = true,
    ): MobInstance {
        const mobId = generateRandomId<MobId>();
        if (this.mobPool.has(mobId)) {
            return this.generateMob(
                type,
                rarity,

                x,
                y,

                petalMaster,
                petMaster,

                connectingSegment,
                isFirstSegment
            );
        }

        const profile: MobData | PetalData = MOB_PROFILES[type] || PETAL_PROFILES[type];

        const mobInstance = new Mob({
            type,
            x,
            y,
            angle: getRandomAngle(),
            magnitude: 0,
            rarity,
            size: isPetal(type) ? 6 : calculateMobSize(profile as MobData, rarity),

            id: mobId,

            // Max health
            health: 1,

            targetEntity: null,

            lastAttackedEntity: null,

            petMaster,
            petGoingToMaster: false,

            petalMaster,
            petalSummonedPet: null,

            petalIsSpinningMob: false,

            petalVelocity: isPetal(type) ? [0, 0] : null,

            starfishRegeningHealth: false,

            connectingSegment,
            isFirstSegment,
        });

        if (isLiving) {
            // Add mob to pool
            this.mobPool.set(mobId, mobInstance);

            // Add to spatial hash
            this.sharedSpatialHash.put(mobInstance);
        }

        return mobInstance;
    }

    private mockPetalDataToReal(
        sp: MockPetalData,
        parent: PlayerInstance,

        isSurface: boolean,
    ): Slot {
        if (!sp) {
            return null;
        }

        const { count } = PETAL_PROFILES[sp.type][sp.rarity];

        const slotPetals: ClusterLike = new Array(count);

        for (let i = 0; i < count; i++) {
            slotPetals[i] = this.generateMob(
                sp.type,
                sp.rarity,

                // Make it player coordinate so its looks like spawning from player body
                parent.x,
                parent.y,

                parent,
                null,

                null,
                false,

                isSurface,
            );
        }

        return slotPetals;
    }

    /**
     * Update all entities.
     */
    private updateEntities() {
        this.clientPool.forEach(client => client[onUpdateTick](this));
        this.mobPool.forEach(mob => mob[onUpdateTick](this));

        this.clientPool.forEach(client => this.sharedSpatialHash.update(client));
        this.mobPool.forEach(mob => this.sharedSpatialHash.update(mob));
    }

    /**
     * Increment progress based on current informations.
     * 
     * TODO: refactor this shit! refactor this shit! refactor this shit! refactor this shit!
     */
    private updateWave() {
        const waveRoomState = this._state();

        if (waveRoomState === WaveRoomState.Started) {
            using _disposable = this._onChangeAnything();

            if (!this.waveData.progressIsRed) {
                const mobData = this.waveProbabilityDeterminer.predictMockData(this.waveData);
                if (mobData) {
                    const [type, rarity] = mobData;

                    const randPos = getRandomSafePosition(this.waveData.mapRadius, SAFETY_DISTANCE, this.getAllClients().filter(p => !p.isDead));
                    if (!randPos) {
                        return null;
                    }

                    if (LINKABLE_MOBS.has(type)) {
                        this.linkedMobSegmentation(type, rarity, randPos[0], randPos[1], 10);
                    } else {
                        this.generateMob(type, rarity, randPos[0], randPos[1]);
                    }
                }
            }

            const waveLength = calculateWaveLength(this.waveData.progress);

            if (this.waveData.progressTimer >= waveLength) {
                // If mob count above 4, start red gage
                if (
                    // Force start into next wave when red gage reached
                    !(this.waveData.progressRedTimer >= waveLength) &&
                    4 < this.getAllMobs().filter(c => /** Dont count petals & pets. */ !c.petMaster && !c.petalMaster).length
                ) {
                    this.waveData.progressIsRed = true;

                    this.waveData.progressRedTimer = Math.min(waveLength, Math.round((this.waveData.progressRedTimer + 0.016) * 10000) / 10000);
                } else {
                    // Respawn all dead players
                    this.clientPool.forEach(c => revivePlayer(this, c));

                    this.waveData.progressIsRed = false;

                    this.waveData.progressRedTimer = 0;

                    this.waveData.progressTimer = 0;

                    this.waveData.progress++;

                    this.waveProbabilityDeterminer.next(this.waveData);
                }
            } else {
                this.waveData.progressTimer = Math.min(waveLength, Math.round((this.waveData.progressTimer + 0.016) * 10000) / 10000);
            }
        }
    }

    /**
     * Create linked mob.
     * 
     * @param bodyCount - Body count not including head.
     */
    public linkedMobSegmentation(
        type: MobType,
        rarity: Rarity,
        x: number,
        y: number,

        bodyCount: number,
    ) {
        const profile: MobData = MOB_PROFILES[type];

        const { collision } = profile;

        const distanceBetween = (collision.rx + collision.ry) * (calculateMobSize(profile, rarity) / collision.fraction);

        let prevSegment: MobInstance = null;

        for (let i = 0; i < bodyCount + 1; i++) {
            const radius = i * distanceBetween;

            prevSegment = this.generateMob(
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
        // Uint8 always range to 0 ~ 255, so no need to sanitize angle & magnitude

        const client = this.clientPool.get(clientId);
        if (client && !client.isDead) {
            client.angle = angle;
            client.magnitude = magnitude * Player.BASE_SPEED;
        }
    }

    /**
     * Updates the mood of a client.
     */
    public changeMood(clientId: PlayerInstance["id"], flag: number) {
        const client = this.clientPool.get(clientId);
        if (client && !client.isDead) {
            client.mood = flag;
        }
    }

    /**
     * Swaps a petal between surface and bottom slots for a client.
     */
    public swapPetal(clientId: PlayerInstance["id"], at: number) {
        const client = this.clientPool.get(clientId);
        // TODO: server broken when client switched petal ffs, fix
        if (
            client &&
            !client.isDead &&
            client.slots.surface.length >= at && client.slots.bottom.length >= at &&
            isLivingSlot(client.slots.bottom[at])
        ) {
            const temp = client.slots.surface[at];

            // Reset cooldown
            client.slots.cooldownsPetal[at] = new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN);
            client.slots.cooldownsUsage[at] = new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN);

            if (temp !== null && isLivingSlot(temp)) {
                temp.forEach(({
                    id,
                    petalSummonedPet,
                }) => {
                    // Remove all petal-binded mob
                    if (this.getMob(id)) {
                        this.removeMob(id);
                    }

                    // Remove summoned mob
                    if (petalSummonedPet && this.getMob(petalSummonedPet.id)) {
                        this.removeMob(petalSummonedPet.id);
                    }
                });
            }

            client.slots.surface[at] = client.slots.bottom[at];
            client.slots.bottom[at] = temp;
        }
    }

    /**
     * Broadcast chat to all clients.
     */
    public broadcastChat(callee: PlayerInstance["id"], msg: string) {
        const buffer = Buffer.alloc(1 + 4 + (1 + msg.length));
        buffer.writeUInt8(ClientBound.WaveChatRecv, 0);

        buffer.writeUInt32BE(callee, 1);

        const msgBuffer = Buffer.from(msg, 'utf-8');
        buffer.writeUInt8(msgBuffer.length, 5);
        msgBuffer.copy(buffer, 6);

        this.clientPool.forEach((player) => {
            player.ws.send(buffer, true);
        });
    }

    private broadcastSeldIdPacket() {
        // Reuse buffer
        const buffer = Buffer.alloc(5);
        buffer.writeUInt8(ClientBound.WaveSelfId, 0);

        // Loop through all WebSocket connections
        this.clientPool.forEach((player, clientId) => {
            buffer.writeUInt32BE(clientId, 1);

            player.ws.send(buffer, true);
        });
    }

    private calculateTotalUpdatePacketSize(): number {
        // Base size for wave data and packet kind
        let size =
            // Opcode
            1 +
            // Wave progress
            2 +
            // Wave progress timer
            8 +
            // Wave progress red timer
            8 +
            // Wave ended
            1 +
            // Map radius
            2;

        // Add size for clients
        // Client count
        size += 2;
        this.clientPool.forEach(client => {
            // String length is dynamically changeable, so we can do is just loop
            size +=
                // Id
                4 +
                // X
                8 +
                // Y
                8 +
                // Angle
                1 +
                // Health
                8 +
                // Size
                4 +
                // Mood
                1 +
                // Nickname size, nickname length
                (1 + client.nickname.length) +
                // Boolean flags
                1;
        });

        // Add size for mobs
        // Mob count
        size += 2;
        size += this.mobPool.size * (
            // Id
            4 +
            // X
            8 +
            // Y
            8 +
            // Angle
            8 +
            // Health
            8 +
            // Size
            4 +
            // Type
            1 +
            // Rarity
            1 +
            // Boolean flags
            1
        );

        // Add size for eliminated entities
        // Eliminated entity count
        size += 2;
        size += this.eliminatedEntities.size * 4;

        return size;
    }

    private createUpdatePacket(): Buffer {
        const buffer = Buffer.alloc(this.calculateTotalUpdatePacketSize());
        let offset = 0;

        // Packet kind
        buffer.writeUInt8(ClientBound.WaveUpdate, offset++);

        // Wave information
        buffer.writeUInt16BE(this.waveData.progress, offset);
        offset += 2;

        buffer.writeDoubleBE(this.waveData.progressTimer, offset);
        offset += 8;

        buffer.writeDoubleBE(this.waveData.progressRedTimer, offset);
        offset += 8;

        const waveRoomState = this._state();
        // Wave is game over or not
        buffer.writeUInt8(waveRoomState === WaveRoomState.Ended ? 1 : 0, offset++);

        // Radius of map
        buffer.writeUInt16BE(this.waveData.mapRadius, offset);
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

            buffer.writeDoubleBE(client.health, offset);
            offset += 8;

            buffer.writeUInt32BE(client.size, offset);
            offset += 4;

            buffer.writeUInt8(client.mood, offset++);

            const nicknameBuffer = Buffer.from(client.nickname, 'utf-8');
            buffer.writeUInt8(nicknameBuffer.length, offset++);
            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;

            // Write boolean flags
            const bFlags =
                // Player is dead, or not
                (client.isDead ? 1 : 0) |
                // Player is developer, or not
                (client.isDev ? 2 : 0);
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
            buffer.writeDoubleBE(mob.health, offset);
            offset += 8;

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
        buffer.writeUInt16BE(this.eliminatedEntities.size, offset);
        offset += 2;

        if (this.eliminatedEntities.size) {
            this.eliminatedEntities.forEach((id) => {
                // Id of entity
                buffer.writeUInt32BE(id, offset);
                offset += 4;
            });

            // Clear eliminated entities ids per packet send
            this.eliminatedEntities.clear();
        }

        return buffer;
    }

    private broadcastUpdatePacket() {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clientPool.forEach((player) => {
            player.ws.send(updatePacket, true);
        });
    }

    getClient(clientId: PlayerInstance["id"]): PlayerInstance | undefined {
        return this.clientPool.get(clientId);
    }

    removeClient(clientId: PlayerInstance["id"]) {
        const client = this.getClient(clientId);
        if (client) {
            // Free memory
            client.dispose();

            this.sharedSpatialHash.remove(client);

            this.eliminatedEntities.add(clientId);

            this.clientPool.delete(clientId);

            logger.region(() => {
                using _guard = logger.metadata({ clientId });
                logger.info("Removed player from wave");
            });
        }
    }

    getAllClients() {
        return Array.from(this.clientPool.values());
    }

    getMob(mobId: MobInstance["id"]): MobInstance | undefined {
        return this.mobPool.get(mobId);
    }

    removeMob(mobId: MobInstance["id"]) {
        const mob = this.getMob(mobId);
        if (mob) {
            // Free memory
            mob.dispose();

            this.sharedSpatialHash.remove(mob);

            this.eliminatedEntities.add(mobId);

            this.mobPool.delete(mobId);
        }
    }

    getAllMobs() {
        return Array.from(this.mobPool.values());
    }
}