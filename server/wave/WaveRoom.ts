import { Biomes } from "../../shared/biomes";
import { PacketKind } from "../../shared/packet";
import { choice, generateRandomWaveRoomPlayerId, getRandomMapSafePosition, getRandomSafePosition } from "../utils/random";
import { EntityPool } from "../entity/EntityPool";
import { PlayerInstance, MockPlayerData } from "../entity/player/Player";
import { logger } from "../main";
import { MAP_CENTER_X, MAP_CENTER_Y, SAFETY_DISTANCE } from "../entity/EntityChecksum";
import { BrandedId } from "../entity/Entity";
import WaveProbabilityPredictor from "./WaveProbabilityPredictor";
import { calculateWaveLength } from "../utils/formula";

/** Represents the current state of a wave room */
export enum WaveRoomState {
    WAITING,
    STARTED,
    END,
}

/** Determines if a wave room is public or private */
export enum WaveRoomVisibleState {
    PUBLIC,
    PRIVATE,
}

/** Indicates if a player is ready to start the wave */
export enum PlayerReadyState {
    UNREADY,
    READY,
}

export type WaveRoomPlayerId = BrandedId<"WaveRoomPlayer">;

/** Extended player data with wave room data properties */
export type WaveRoomPlayer = MockPlayerData & {
    id: WaveRoomPlayerId;
    isOwner: boolean;
    readyState: PlayerReadyState;
};

export interface WaveData {
    /**
    * Current wave progress.
    */
    waveProgress: number;
    waveProgressTimer: number;
    waveProgressRedGageTimer: number;
    waveProgressIsRedGage: boolean;

    mapSize: number;
}

export const ROOM_UPDATE_SEND_FPS = 30;

export const WAVE_PROGRESS_UPDATE = 60;

/**
 * The wave room, aka squad.
 */
export default class WaveRoom {
    public static readonly MAX_PLAYER_AMOUNT = 4;

    visible: WaveRoomVisibleState;
    state: WaveRoomState;
    roomCandidates: WaveRoomPlayer[];
    entityPool: EntityPool;

    private updateInterval: NodeJS.Timeout;

    private entitySpawnRandomizer: WaveProbabilityPredictor;

    /**
     * Current wave data transfer to entity pool.
     */
    public waveData: WaveData = {
        waveProgress: 52,
        waveProgressTimer: 0,
        waveProgressRedGageTimer: 0,
        waveProgressIsRedGage: false,

        mapSize: 2600,
    };;

    public wavePreUpdateInterval: NodeJS.Timeout;

    constructor(public readonly biome: Biomes, public readonly code: string) {
        this.visible = WaveRoomVisibleState.PUBLIC;
        this.state = WaveRoomState.WAITING;
        this.entityPool = new EntityPool(this.waveData);

        this.roomCandidates = new Array<WaveRoomPlayer>();

        this.updateInterval = setInterval(this.broadcastUpdatePacket.bind(this), 1000 / ROOM_UPDATE_SEND_FPS);
        this.wavePreUpdateInterval = setInterval(this.wavePreUpdate.bind(this), 1000 / WAVE_PROGRESS_UPDATE);

        this.entitySpawnRandomizer = new WaveProbabilityPredictor(this.waveData);
    }

    /**
     * Release all memory in this class.
     */
    public releaseAllMemory() {
        this.entityPool.releaseAllMemory();

        this.entityPool = null;

        this.roomCandidates = null;

        this.entitySpawnRandomizer = null;

        this.waveData = null;

        clearInterval(this.updateInterval);
        clearInterval(this.wavePreUpdateInterval);

        this.updateInterval = null;
        this.wavePreUpdateInterval = null;
    }

    private wavePreUpdate() {
        // Use onChangeSomething so can delete started wave if all players dead
        using _disposable = this.onChangeAnything();

        if (!this.waveData.waveProgressIsRedGage && this.state === WaveRoomState.STARTED) {
            const mobData = this.entitySpawnRandomizer.predictMockData(this.waveData);
            if (mobData) {
                const [type, rarity] = mobData;

                const randPos = getRandomMapSafePosition(MAP_CENTER_X, MAP_CENTER_Y, this.waveData.mapSize, SAFETY_DISTANCE, this.entityPool.getAllClients().filter(p => !p.isDead));
                if (!randPos) {
                    return null;
                }

                this.entityPool.addPetalOrMob(type, rarity, randPos[0], randPos[1]);
            }
        }

        // Dont do anything when wave waiting/end
        if (this.state === WaveRoomState.STARTED) {
            const waveLength = calculateWaveLength(this.waveData.waveProgress);

            if (this.waveData.waveProgressTimer >= waveLength) {
                // If mob count above 4, start red gage
                if (
                    // Force start into next wave when red gage reached
                    !(this.waveData.waveProgressRedGageTimer >= waveLength) &&
                    4 < this.entityPool.getAllMobs().filter(c => /** Dont count petals & pets. */ !c.petParentPlayer && !c.petalParentPlayer).length
                ) {
                    this.waveData.waveProgressIsRedGage = true;

                    this.waveData.waveProgressRedGageTimer = Math.min(waveLength, Math.round((this.waveData.waveProgressRedGageTimer + 0.016) * 100000) / 100000);
                } else {
                    // Respawn all dead players
                    this.entityPool.clients.forEach(c => {
                        if (c.isDead) {
                            const alivePlayers = this.entityPool.getAllClients().filter(p => !p.isDead);

                            if (alivePlayers.length > 0) {
                                // Select random players
                                const randomAlivePlayer = choice(alivePlayers);

                                const randPos = getRandomSafePosition(
                                    randomAlivePlayer.x,
                                    randomAlivePlayer.y,
                                    200,
                                );

                                // Make it max health so player will respawn without die again
                                c.health = c.maxHealth;
                                c.isDead = false;

                                if (randPos) {
                                    c.x = randPos[0];
                                    c.y = randPos[1];
                                } else {
                                    c.x = MAP_CENTER_X;
                                    c.y = MAP_CENTER_Y;
                                }
                            }
                        }
                    });

                    this.waveData.waveProgressIsRedGage = false;

                    this.waveData.waveProgressRedGageTimer = 0;

                    this.waveData.waveProgressTimer = 0;

                    this.waveData.waveProgress++;

                    this.entitySpawnRandomizer.reset(this.waveData);
                }
            } else {
                this.waveData.waveProgressTimer = Math.min(waveLength, Math.round((this.waveData.waveProgressTimer + 0.016) * 100000) / 100000);
            }
        }
    }

    /**
     * Broadcasts the current room state to all players
     */
    private broadcastUpdatePacket() {
        const waveClientsPacket = this.createWaveRoomUpdatePacket();

        this.roomCandidates.forEach((player) => {
            player.ws.send(waveClientsPacket, true);
        });
    }

    private calculateWaveRoomUpdatePacketSize(): number {
        let size = 1 + 1 + (this.code.length + 1) + 1 + 1 + 1;
        this.roomCandidates.forEach(client => {
            size += 4 + 1 + 1 + client.name.length;
        });
        return size;
    }

    private createWaveRoomUpdatePacket() {
        const size = this.calculateWaveRoomUpdatePacketSize();
        const buffer = Buffer.alloc(size);
        let offset = 0;

        buffer.writeUInt8(PacketKind.WAVE_ROOM_UPDATE, offset++);

        // Client count
        buffer.writeUInt8(this.roomCandidates.length, offset++);

        this.roomCandidates.forEach(client => {
            buffer.writeUInt32BE(client.id, offset);
            offset += 4;

            buffer.writeUInt8(client.isOwner ? 1 : 0, offset++);

            // TODO: send static petal data too

            const nicknameBuffer = Buffer.from(client.name, 'utf-8');
            buffer.writeUInt8(nicknameBuffer.length, offset++);
            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;
        });

        const codeBuffer = Buffer.from(this.code, 'utf-8');
        buffer.writeUInt8(codeBuffer.length, offset++);
        codeBuffer.copy(buffer, offset);
        offset += codeBuffer.length;

        buffer.writeUInt8(this.biome, offset++);

        buffer.writeUInt8(this.state, offset++);

        buffer.writeUInt8(this.visible === WaveRoomVisibleState.PUBLIC ? 1 : 0, offset++);

        return buffer;
    }

    public addPlayer(player: MockPlayerData): WaveRoomPlayerId | false {
        if (this.state !== WaveRoomState.WAITING) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        if (!this.canAddCandidate) {
            return false;
        }

        const id = generateRandomWaveRoomPlayerId();

        // Ensure unique clientId
        if (this.roomCandidates.map(v => v.id).includes(id)) {
            return this.addPlayer(player);
        }

        this.roomCandidates.push({
            ...player,
            id,
            readyState: PlayerReadyState.UNREADY,
            // First player is owner
            isOwner: this.roomCandidates.length === 0,
        });

        logger.region(() => {
            using _guard = logger.metadata({ waveClientId: id, code: this.code });
            logger.info("Added player on wave room");
        });

        return id;
    }

    public removePlayer(id: WaveRoomPlayer["id"]): boolean {
        if (this.state !== WaveRoomState.WAITING) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        const index = this.roomCandidates.findIndex(p => p.id === id);
        if (index >= 0) {
            const savedIsOwner = this.roomCandidates[index]?.isOwner;
            this.roomCandidates.splice(index, 1);

            logger.region(() => {
                using _guard = logger.metadata({ waveClientId: id, code: this.code });
                logger.info("Removed player from wave room");
            });

            // Grant owner to second joined candidate
            if (savedIsOwner && this.roomCandidates.length !== 0 && this.roomCandidates[0]) {
                this.roomCandidates[0].isOwner = true;
            }

            return true;
        } else {
            return false;
        };
    }

    public setPlayerReadyState(id: WaveRoomPlayer["id"], state: PlayerReadyState): boolean {
        if (this.state !== WaveRoomState.WAITING) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        const index = this.roomCandidates.findIndex(p => p.id === id);
        if (index >= 0) {
            this.roomCandidates[index].readyState = state;

            logger.region(() => {
                using _guard = logger.metadata({ state: PlayerReadyState[state], waveClientId: id, code: this.code });
                logger.info("Player changed ready state");
            });

            return true;
        } else {
            return false;
        };
    }

    public setPublicState(id: WaveRoomPlayer["id"], state: WaveRoomVisibleState): boolean {
        if (this.state !== WaveRoomState.WAITING) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        const playerData = this.roomCandidates.find(p => p.id === id);
        if (!playerData?.isOwner) {
            return false;
        }

        this.visible = state;

        logger.region(() => {
            using _guard = logger.metadata({ state: WaveRoomVisibleState[state], waveClientId: id, code: this.code });
            logger.info("Player changed visible state");
        });

        return true;
    }

    private startWave() {
        this.state = WaveRoomState.STARTED;
        clearInterval(this.updateInterval);
        this.entityPool.startWave(this.biome, this.roomCandidates);

        logger.region(() => {
            using _guard = logger.metadata({
                candidateIds: this.roomCandidates.map(c => c.id).join(","),
                code: this.code,
                wave: this.waveData.waveProgress,
            });
            logger.info("Wave starting");
        });
    }

    private endWave() {
        this.state = WaveRoomState.END;

        // Stop wave update
        this.entityPool.endWave();

        logger.region(() => {
            using _guard = logger.metadata({ code: this.code, wave: this.waveData.waveProgress });
            logger.info("Wave ended");
        });
    }

    /**
     * Disposable checksum.
     */
    public onChangeAnything = (): Disposable => {
        return { [Symbol.dispose]: () => this._roomChecksum() };
    }

    /**
     * Checksum room values.
     */
    public _roomChecksum() {
        // this.roomCandidates.length !== 0 to prevent multiple wave start, before wave room deletion
        if (this.state === WaveRoomState.WAITING && this.roomCandidates.length !== 0 && this.roomCandidates.every(p => p.readyState === PlayerReadyState.READY)) {
            this.startWave();
        }

        if (this.state === WaveRoomState.STARTED && this.entityPool.getAllClients().every(p => p.isDead)) {
            this.endWave();
        }
    }

    /**
     * Determines if this wave room is joinable.
     */
    public get canAddCandidate() {
        return this.roomCandidates.length < WaveRoom.MAX_PLAYER_AMOUNT && this.state === WaveRoomState.WAITING;
    }
}