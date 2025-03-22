import type { Biome } from "../../../../../Shared/Biome";
import type { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import type { MobType, PetalType } from "../../../../../Shared/Entity/Statics/EntityType";
import type { MobData } from "../../../../../Shared/Entity/Statics/Mob/MobData";
import { MOB_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import type { PetalData } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import { PETAL_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import { calculateWaveLength } from "../../../../../Shared/Formula";
import { MoodFlags } from "../../../../../Shared/Mood";
import { WaveRoomState } from "../../../../../Shared/WaveRoom";
import { logger } from "../../../../Main";
import type { Entity } from "../../Entity/Dynamics/Entity";
import { ON_UPDATE_TICK } from "../../Entity/Dynamics/Entity";
import { calculateMobSize } from "../../Entity/Dynamics/EntityCollision";
import { revivePlayer } from "../../Entity/Dynamics/EntityElimination";
import { SAFETY_DISTANCE } from "../../Entity/Dynamics/EntityCoordinateBoundary";
import type { MobInstance, MobId } from "../../Entity/Dynamics/Mob/Mob";
import { Mob } from "../../Entity/Dynamics/Mob/Mob";
import type { StaticPetalData, DynamicPetal } from "../../Entity/Dynamics/Mob/Petal/Petal";
import { MAX_CLUSTER_AMOUNT, isDynamicPetal } from "../../Entity/Dynamics/Mob/Petal/Petal";
import type { PlayerId, StaticPlayerData, PlayerInstance } from "../../Entity/Dynamics/Player/Player";
import { Player } from "../../Entity/Dynamics/Player/Player";
import { PETAL_INITIAL_COOLDOWN } from "../../Entity/Dynamics/Player/PlayerPetalReload";
import SpatialHash from "../../Entity/Statics/Collision/CollisionSpatialHash";
import AbstractPool from "../GenrePool";
import SpawnMobDeterminer, { LINKABLE_MOBS } from "./Mathematics/Random/WavePoolSpawnMobDeterminer";
import type { WaveRoomPlayerId, WaveRoomPlayer } from "./WaveRoom";
import { generateRandomId } from "./WaveRoom";
import { getRandomCoordinate, getRandomSafeCoordinate } from "../../Entity/Dynamics/EntityCoordinateMovement";
import { isPetal } from "../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import BinarySizedWriter from "../../../../../Shared/Websocket/Binary/ReadWriter/Writer/BinarySizedWriter";
import { Clientbound } from "../../../../../Shared/Websocket/Packet/PacketDirection";

// Define UserData for WebSocket connections
export interface UserData {
    waveRoomClientId: WaveRoomPlayerId;
    waveClientId: PlayerId;

    /**
     * Static data of player.
     * 
     * @remarks
     * This data is used to squad ui to display petals and names and to convert them when wave starting.
     */
    staticPlayerData: StaticPlayerData;
}

export const UPDATE_FPS = 60;

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

export class WavePool extends AbstractPool {
    private static readonly SPATIAL_HASH_GRID_SIZE = 1024;

    public clientPool: Map<PlayerId, PlayerInstance>;
    public mobPool: Map<MobId, MobInstance>;

    private eliminatedEntities: Set<PlayerId | MobId>;

    private spawnMobDeterminer: SpawnMobDeterminer;

    private updateInterval: NodeJS.Timeout;
    private frameCount: number = 0;

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
        super();

        this.clientPool = new Map();
        this.mobPool = new Map();

        this.eliminatedEntities = new Set();

        this.spawnMobDeterminer = new SpawnMobDeterminer();
        this.spawnMobDeterminer.next(this.waveData);

        this.sharedSpatialHash = new SpatialHash<Entity>(WavePool.SPATIAL_HASH_GRID_SIZE);
    }

    /**
     * Release all memory in this class.
     */
    public releaseAllMemory() {
        // Clear update timer first
        clearInterval(this.updateInterval);
        this.updateInterval = null;

        this.clientPool.forEach((v) => v[Symbol.dispose]());
        this.mobPool.forEach((v) => v[Symbol.dispose]());

        this.clientPool.clear();
        this.mobPool.clear();

        this.clientPool = null;
        this.mobPool = null;

        this.eliminatedEntities = null;

        this.spawnMobDeterminer = null;

        this.waveData = null;

        this.sharedSpatialHash.reset();
        this.sharedSpatialHash = null;

        this._state = null;
        this._onChangeAnything = null;

        logger.info("Released wave pool memory");
    }

    /**
     * Starts wave.
     * 
     * @param biome - Biome of wave
     * @param roomCandidates - List of players
     */
    public startWave(roomCandidates: WaveRoomPlayer[]) {
        const waveStartedWriter = new BinarySizedWriter(2);

        waveStartedWriter.writeUInt8(Clientbound.WAVE_STARTED);

        waveStartedWriter.writeUInt8(this.waveData.biome);

        // Spawn all candidates at random position
        roomCandidates.forEach(player => {
            const randPos = getRandomCoordinate(this.waveData.mapRadius, this.waveData.mapRadius, this.waveData.mapRadius);

            const client = this.generateClient(player, randPos[0], randPos[1]);

            player.ws.send(waveStartedWriter.buffer, true);

            player.ws.getUserData().waveClientId = client.id;

            logger.region(() => {
                using _guard = logger.metadata({ clientId: client.id });
                logger.info("Added player on wave");
            });
        });

        // Broadcast self id to all connection
        this.broadcastSeldIdPacket();

        // Use single interval with the highest FPS (60)
        this.updateInterval = setInterval(this.update.bind(this), 1000 / UPDATE_FPS);
    }

    public endWave() {
    }

    private update() {
        this.frameCount++;

        // Update entities every frame (60 FPS)
        this.updateEntities();

        if (this.frameCount % 2 === 0) {
            // Update wave at 30 FPS (every 2 frames)
            this.updateWave();

            // Update packet sending at ~33 FPS (every 2 frames)
            this.broadcastUpdatePacket();
        }

        // Reset frame counter to prevent potential overflow
        if (this.frameCount >= 120) {
            this.frameCount = 0;
        }
    }

    /**
     * Generates a player.
     * 
     * @remarks
     * Although no need to implement isLiving parameter because theres no dummy players.
     * 
     * @param clientData - Mock data of player
     * @param x - X coordinate of mob
     * @param y - Y coordinate of mob
     * @returns Instance of player
     */
    public generateClient(
        clientData: StaticPlayerData,

        x: number,
        y: number,
    ): PlayerInstance {
        const clientId = generateRandomId<PlayerId>();

        // Ensure unique clientId
        if (this.clientPool.has(clientId)) {
            return this.generateClient(
                clientData,

                x,
                y,
            );
        }

        const playerInstance = new Player({
            x,
            y,
            angle: 0,
            magnitude: 0,
            mood: MoodFlags.NORMAL,
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
            // Ensure c is StaticPetal
            c &&
            !isDynamicPetal(c) &&
            this.staticPetalDataToDynamicPetal(c, playerInstance, true),
        );
        playerInstance.slots.bottom = clientData.slots.bottom.map(c =>
            c &&
            !isDynamicPetal(c) &&
            this.staticPetalDataToDynamicPetal(c, playerInstance, false),
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
     * This is also used to generate petals.
     * 
     * @param type - Type of mob
     * @param rarity - Rarity of mob
     * 
     * @param x - X coordinate of mob
     * @param y - Y coordinate of mob
     * 
     * @param petalMaster - Master of petal
     * @param petMaster - Master of pet
     * 
     * @param connectingSegment - Connecting mob segment
     * @param isFirstSegment - Mob to generate is first segment (like centi head)
     * 
     * @param isLiving - Should add to pool (living) or not. This will used for just creating dummy instance
     * @returns Instance of mob
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
                isFirstSegment,
            );
        }

        const profile: MobData | PetalData = MOB_PROFILES[type] || PETAL_PROFILES[type];

        const mobInstance = new Mob({
            type,
            x,
            y,
            angle: Math.random() * 256,
            magnitude: 0,
            rarity,
            size: isPetal(type)
                ? 6
                : calculateMobSize(profile as MobData, rarity),

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

            petalVelocity: isPetal(type)
                ? [0, 0]
                : null,

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

    private staticPetalDataToDynamicPetal(
        staticPetalData: StaticPetalData,
        parent: PlayerInstance,
        isSurface: boolean,
    ): DynamicPetal {
        const { count } = PETAL_PROFILES[staticPetalData.type][staticPetalData.rarity];

        const slotPetals = new Array<MobInstance>(count);

        for (let i = 0; i < count; i++) {
            slotPetals[i] = this.generateMob(
                staticPetalData.type,
                staticPetalData.rarity,

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

        // Not typesafe but ok
        return slotPetals as DynamicPetal;
    }

    /**
     * Update all entities.
     */
    private updateEntities() {
        for (const client of this.clientPool.values()) {
            client[ON_UPDATE_TICK](this);
        }
        for (const mob of this.mobPool.values()) {
            mob[ON_UPDATE_TICK](this);
        }

        for (const client of this.clientPool.values()) {
            this.sharedSpatialHash.update(client);
        }
        for (const mob of this.mobPool.values()) {
            this.sharedSpatialHash.update(mob);
        }
    }

    /**
     * Increment progress based on current informations.
     * 
     * TODO: refactor this shit! refactor this shit! refactor this shit! refactor this shit!
     */
    private updateWave() {
        const waveRoomState = this._state();

        if (waveRoomState === WaveRoomState.Playing) {
            using _disposable = this._onChangeAnything();

            if (!this.waveData.progressIsRed) {
                const staticMobData = this.spawnMobDeterminer.determineStaticMobData(this.waveData);
                if (staticMobData) {
                    const [type, rarity] = staticMobData;

                    const randPos = getRandomSafeCoordinate(this.waveData.mapRadius, SAFETY_DISTANCE, this.getAllClients().filter(p => !p.isDead));
                    if (!randPos) return null;

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
                    4 < this.getAllMobs()
                        .filter(c => !(c.petMaster || c.petalMaster))
                        .length
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

                    this.spawnMobDeterminer.next(this.waveData);
                }
            } else {
                this.waveData.progressTimer = Math.min(waveLength, Math.round((this.waveData.progressTimer + 0.016) * 10000) / 10000);
            }
        }
    }

    /**
     * Create linked mob.
     * 
     * @param bodyCount - Body count not including head
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
    public updateMovement(clientId: PlayerId, angle: number, magnitude: number) {
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
    public changeMood(clientId: PlayerId, flag: number) {
        const client = this.clientPool.get(clientId);
        if (client && !client.isDead) {
            client.mood = flag;
        }
    }

    /**
     * Swaps a petal between surface and bottom slots for a client.
     */
    public swapPetal(clientId: PlayerId, at: number) {
        const client = this.clientPool.get(clientId);
        // TODO: server broken when client switched petal ffs, fix
        if (
            client &&
            !client.isDead &&
            client.slots.surface.length >= at && client.slots.bottom.length >= at &&
            isDynamicPetal(client.slots.bottom[at])
        ) {
            const temp = client.slots.surface[at];

            // Reset cooldown
            client.slots.cooldownsPetal[at] = new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN);
            client.slots.cooldownsUsage[at] = new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN);

            if (temp && isDynamicPetal(temp)) {
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
    public broadcastChat(callee: PlayerId, message: string) {
        const waveChatReceivWriter = new BinarySizedWriter(
            // Opcode size
            1 +
            // Player id size
            4 +
            // Length + null terminator
            (
                message.length +
                1
            ),
        );

        waveChatReceivWriter.writeUInt8(Clientbound.WAVE_CHAT_RECEIV);

        waveChatReceivWriter.writeUInt32(callee);

        waveChatReceivWriter.writeString(message);

        const { buffer } = waveChatReceivWriter;

        this.clientPool.forEach((player) => {
            player.ws.send(buffer, true);
        });
    }

    private broadcastSeldIdPacket() {
        const waveSelfIdWriter = new BinarySizedWriter(5);

        waveSelfIdWriter.writeUInt8(Clientbound.WAVE_SELF_ID);

        // Loop through all WebSocket connections
        this.clientPool.forEach((player, clientId) => {
            waveSelfIdWriter.setOffset(1);
            waveSelfIdWriter.writeUInt32(clientId);

            player.ws.send(waveSelfIdWriter.buffer, true);
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

    private createUpdatePacket(): Uint8Array {
        const waveUpdateWriter = new BinarySizedWriter(this.calculateTotalUpdatePacketSize());

        // Opcode
        waveUpdateWriter.writeUInt8(Clientbound.WAVE_UPDATE);

        // Wave informations

        waveUpdateWriter.writeUInt16(this.waveData.progress);

        waveUpdateWriter.writeFloat64(this.waveData.progressTimer);

        waveUpdateWriter.writeFloat64(this.waveData.progressRedTimer);

        const waveRoomState = this._state();
        // Wave is game over or not
        waveUpdateWriter.writeUInt8(
            waveRoomState === WaveRoomState.Ended
                ? 1
                : 0,
        );

        // Radius of map
        waveUpdateWriter.writeUInt16(this.waveData.mapRadius);

        // Write client size
        waveUpdateWriter.writeUInt16(this.clientPool.size);

        this.clientPool.forEach(client => {
            waveUpdateWriter.writeUInt32(client.id);

            waveUpdateWriter.writeFloat64(client.x);
            waveUpdateWriter.writeFloat64(client.y);

            waveUpdateWriter.writeUInt8(client.angle);

            waveUpdateWriter.writeFloat64(client.health);

            waveUpdateWriter.writeUInt32(client.size);

            waveUpdateWriter.writeUInt8(client.mood);

            waveUpdateWriter.writeString(client.nickname);

            // Write boolean flags
            const bFlags =
                // Player is dead, or not
                (client.isDead ? 1 : 0) |
                // Player is developer, or not
                (client.isDev ? 2 : 0);
            waveUpdateWriter.writeUInt8(bFlags);
        });

        // Write mobs
        waveUpdateWriter.writeUInt16(this.mobPool.size);

        this.mobPool.forEach(mob => {
            // Id of mob
            waveUpdateWriter.writeUInt32(mob.id);

            // Coordinate of mob
            waveUpdateWriter.writeFloat64(mob.x);
            waveUpdateWriter.writeFloat64(mob.y);

            // Angle of mob
            waveUpdateWriter.writeFloat64(mob.angle);

            // Health of mob
            waveUpdateWriter.writeFloat64(mob.health);

            // Size of mob
            waveUpdateWriter.writeUInt32(mob.size);

            // Type of mob
            waveUpdateWriter.writeUInt8(mob.type);

            // Rarity of mob
            waveUpdateWriter.writeUInt8(mob.rarity);

            // Write boolean flags
            const bFlags =
                // Mob is pet, or not
                (mob.petMaster ? 1 : 0) |
                // Mob is first segment, or not
                (mob.isFirstSegment ? 2 : 0);
            waveUpdateWriter.writeUInt8(bFlags);
        });

        // Write eliminated entities
        waveUpdateWriter.writeUInt16(this.eliminatedEntities.size);

        if (this.eliminatedEntities.size) {
            this.eliminatedEntities.forEach((id) => {
                // Id of entity
                waveUpdateWriter.writeUInt32(id);
            });

            // Clear eliminated entities ids per packet send
            this.eliminatedEntities.clear();
        }

        return waveUpdateWriter.buffer;
    }

    private broadcastUpdatePacket() {
        const updatePacket = this.createUpdatePacket();

        // Loop through all WebSocket connections
        this.clientPool.forEach((player) => {
            player.ws.send(updatePacket, true);
        });
    }

    getClient(clientId: PlayerId): PlayerInstance | undefined {
        return this.clientPool.get(clientId);
    }

    removeClient(clientId: PlayerId) {
        const client = this.getClient(clientId);
        if (client) {
            // Free memory
            client[Symbol.dispose]();

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

    getMob(mobId: MobId): MobInstance | undefined {
        return this.mobPool.get(mobId);
    }

    removeMob(mobId: MobId) {
        const mob = this.getMob(mobId);
        if (mob) {
            // Free memory
            mob[Symbol.dispose]();

            this.sharedSpatialHash.remove(mob);

            this.eliminatedEntities.add(mobId);

            this.mobPool.delete(mobId);
        }
    }

    getAllMobs() {
        return Array.from(this.mobPool.values());
    }
}