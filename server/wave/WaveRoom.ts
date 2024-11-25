import { choice, generateRandomWaveRoomPlayerId, getRandomMapSafePosition, getRandomPosition } from "../utils/random";
import { UserData, WavePool } from "./WavePool";
import { PlayerInstance, MockPlayerData } from "../entity/player/Player";
import { logger } from "../main";
import { BrandedId } from "../entity/Entity";
import WaveProbabilityPredictor from "./WaveProbabilityPredictor";
import { calculateWaveLength } from "../utils/formula";
import { SAFETY_DISTANCE } from "../entity/EntityWorldBoundary";
import { Biomes, Packet } from "../../shared/enum";
import root from "../command/commandRoot";
import { Command, repondValueToString } from "../command/command";

/**
 * Revive player nearby other player.
 */
function revivePlayer(wavePool: WavePool, player: PlayerInstance) {
    if (player.isDead) {
        const alivePlayers = wavePool.getAllClients().filter(p => !p.isDead && p.id !== player.id);
        if (alivePlayers.length > 0) {
            // Select random player
            const randomAlivePlayer = choice(alivePlayers);

            const randPos = getRandomPosition(
                randomAlivePlayer.x,
                randomAlivePlayer.y,
                200,
            );

            // Make it max health so player will respawn without die again
            player.health = player.maxHealth;
            player.isDead = false;

            player.x = randPos[0];
            player.y = randPos[1];

            // Disable dead camera
            player.playerDeadCameraTargetEntity = null;
        }
    }
}

/** Represents the current state of a wave room */
export enum WaveRoomState {
    WAITING,
    STARTED,
    ENDED,
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
    waveMapSize: number;
    waveEnded: boolean;
}

export const ROOM_UPDATE_SEND_FPS = 30;

export const WAVE_PROGRESS_UPDATE = 60;

/**
 * The wave room, aka squad.
 */
export default class WaveRoom {
    /**
     * Max player amount.
     */
    public static readonly MAX_PLAYER_AMOUNT = 4;

    state: WaveRoomState;
    visible: WaveRoomVisibleState;
    roomCandidates: WaveRoomPlayer[];

    wavePool: WavePool;

    private updateInterval: NodeJS.Timeout;

    private waveProbabilityPredictor: WaveProbabilityPredictor;

    /**
     * Current wave data transfer to entity pool.
     */
    public waveData: WaveData = {
        waveProgress: 52,
        waveProgressTimer: 0,
        waveProgressRedGageTimer: 0,
        waveProgressIsRedGage: false,
        waveMapSize: 5000,
        waveEnded: false,
    };;

    public wavePreUpdateInterval: NodeJS.Timeout;

    constructor(public readonly biome: Biomes, public readonly code: string) {
        this.visible = WaveRoomVisibleState.PUBLIC;
        this.state = WaveRoomState.WAITING;
        this.wavePool = new WavePool(this.waveData);

        this.roomCandidates = new Array<WaveRoomPlayer>();

        this.updateInterval = setInterval(this.broadcastUpdatePacket.bind(this), 1000 / ROOM_UPDATE_SEND_FPS);
        this.wavePreUpdateInterval = setInterval(this.wavePreUpdate.bind(this), 1000 / WAVE_PROGRESS_UPDATE);

        this.waveProbabilityPredictor = new WaveProbabilityPredictor();
        this.waveProbabilityPredictor.reset(this.waveData);
    }

    /**
     * Release all memory in this class.
     */
    public releaseAllMemory() {
        this.wavePool.releaseAllMemory();

        this.wavePool = null;

        clearInterval(this.updateInterval);
        clearInterval(this.wavePreUpdateInterval);

        this.updateInterval = null;
        this.wavePreUpdateInterval = null;

        this.roomCandidates = null;

        this.waveProbabilityPredictor = null;

        this.waveData = null;
    }

    private wavePreUpdate() {
        // Use onChangeSomething so can delete started wave if all players dead
        using _disposable = this.onChangeAnything();

        this.waveData.waveEnded = this.state === WaveRoomState.ENDED;

        // Dont do anything when wave waiting/end
        if (this.state === WaveRoomState.STARTED) {
            if (!this.waveData.waveProgressIsRedGage) {
                const mobData = this.waveProbabilityPredictor.predictMockData(this.waveData);
                if (mobData) {
                    const [type, rarity] = mobData;

                    const randPos = getRandomMapSafePosition(this.waveData.waveMapSize, SAFETY_DISTANCE, this.wavePool.getAllClients().filter(p => !p.isDead));
                    if (!randPos) {
                        return null;
                    }

                    this.wavePool.addPetalOrMob(type, rarity, randPos[0], randPos[1]);
                }
            }

            const waveLength = calculateWaveLength(this.waveData.waveProgress);

            if (this.waveData.waveProgressTimer >= waveLength) {
                // If mob count above 4, start red gage
                if (
                    // Force start into next wave when red gage reached
                    !(this.waveData.waveProgressRedGageTimer >= waveLength) &&
                    4 < this.wavePool.getAllMobs().filter(c => /** Dont count petals & pets. */ !c.petMaster && !c.petalMaster).length
                ) {
                    this.waveData.waveProgressIsRedGage = true;

                    this.waveData.waveProgressRedGageTimer = Math.min(waveLength, Math.round((this.waveData.waveProgressRedGageTimer + 0.016) * 100000) / 100000);
                } else {
                    // Respawn all dead players
                    this.wavePool.clients.forEach(c => revivePlayer(this.wavePool, c));

                    this.waveData.waveProgressIsRedGage = false;

                    this.waveData.waveProgressRedGageTimer = 0;

                    this.waveData.waveProgressTimer = 0;

                    this.waveData.waveProgress++;

                    this.waveProbabilityPredictor.reset(this.waveData);
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

        buffer.writeUInt8(Packet.WAVE_ROOM_UPDATE, offset++);

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
        this.wavePool.startWave(this.biome, this.roomCandidates);

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
        this.state = WaveRoomState.ENDED;

        // Stop wave update
        this.wavePool.endWave();

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

        if (this.state === WaveRoomState.STARTED && this.wavePool.getAllClients().every(p => p.isDead)) {
            this.endWave();
        }
    }

    /**
     * Proccess chat message.
     */
    public async processChatMessage(userData: UserData, msg: string) {
        if (userData && msg.length > 0) {
            if (msg.startsWith(Command.COMMAND_PREFIX)) {
                const executedResultString = await repondValueToString(
                    root.execute(
                        userData,
                        // Remove prefix, then split
                        msg.slice(Command.COMMAND_PREFIX.length).split(" "),
                    )
                );

                if (executedResultString === null) {
                    this.wavePool.sendChat(userData.waveClientId, "Empty result returned. You may missed something.");
                    return;
                }

                this.wavePool.sendChat(userData.waveClientId, executedResultString);
            } else {
                // Public chat
                this.wavePool.broadcastChat(msg);
            }
        }
    }

    /**
     * Determines if this wave room is joinable.
     */
    public get canAddCandidate() {
        return this.roomCandidates.length < WaveRoom.MAX_PLAYER_AMOUNT && this.state === WaveRoomState.WAITING;
    }
}