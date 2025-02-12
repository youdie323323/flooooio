import { Biome } from "../../../Shared/biome";
import { ClientBound } from "../../../Shared/packet";
import { WaveRoomPlayerReadyState, WaveRoomVisibleState, WaveRoomState } from "../../../Shared/WaveRoom";
import { logger } from "../../main";
import { BrandedId } from "../Entity/Entity";
import { MockPlayerData, Player } from "../Entity/Player/Player";
import { generateRandomId } from "../Utils/random";
import { WavePool, UserData, WaveData } from "./WavePool";
import { createHash } from 'node:crypto';
import { WaveRoomCode } from "../../../Shared/WaveRoomCode";

export type WaveRoomPlayerId = BrandedId<"WaveRoomPlayer">;

/** Extended player data with wave room data properties */
export type WaveRoomPlayer = MockPlayerData & {
    id: WaveRoomPlayerId;
    readyState: WaveRoomPlayerReadyState;
    isOwner: boolean;
};

export const WAVE_ROOM_UPDATE_SEND_FPS = 30;

export const WAVE_ROOM_UPDATE_FPS = 60;

function sha256(input: string): string {
    const hash = createHash("sha256");
    hash.update(input);
    return hash.digest("hex");
}

/**
 * The wave room, aka squad.
 */
export default class WaveRoom {
    /**
     * A number represents maxium player that how many joinable.
     */
    private static readonly MAX_PLAYER_AMOUNT = 4;

    /**
     * Wave room update packet send interval, used for like players update
     */
    private waveRoomPacketSendInterval: NodeJS.Timeout;

    /**
     * Stores pool for this wave room.
     */
    public wavePool: WavePool;

    constructor(
        // In-game related
        public readonly biome: Biome,
        public readonly code: WaveRoomCode,

        // Wave room related
        public visible: WaveRoomVisibleState = WaveRoomVisibleState.Public,
        public state: WaveRoomState = WaveRoomState.Waiting,
        public roomCandidates: WaveRoomPlayer[] = new Array<WaveRoomPlayer>(),
    ) {
        this.waveRoomPacketSendInterval = setInterval(this.broadcastWaveRoomPacket.bind(this), 1000 / WAVE_ROOM_UPDATE_SEND_FPS);

        this.wavePool = new WavePool(
            this.constructWaveData(),

            () => this.state,
            this.onChangeAnything,
        );
    }

    /**
     * Release all memory in this class.
     */
    public releaseAllMemory() {
        this.wavePool.releaseAllMemory();

        this.wavePool = null;

        clearInterval(this.waveRoomPacketSendInterval);

        this.waveRoomPacketSendInterval = null;

        this.roomCandidates = null;

        logger.info("Released wave room memory");
    }

    /**
     * Construct the wave data for wave pool.
     * 
     * @returns - Constructed wave data.
     */
    private constructWaveData(): WaveData {
        return {
            progress: 36,
            progressTimer: 0,
            progressRedTimer: 0,
            progressIsRed: false,

            mapRadius: 3000,

            biome: this.biome,
        } satisfies WaveData;
    }

    /**
     * Broadcasts the current room state to all players
     */
    private broadcastWaveRoomPacket() {
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
        const buffer = Buffer.alloc(this.calculateWaveRoomUpdatePacketSize());
        let offset = 0;

        buffer.writeUInt8(ClientBound.WaveRoomUpdate, offset++);

        // Client count
        buffer.writeUInt8(this.roomCandidates.length, offset++);

        this.roomCandidates.forEach(client => {
            buffer.writeUInt32BE(client.id, offset);
            offset += 4;

            // TODO: send static petal data too

            const nicknameBuffer = Buffer.from(client.name, 'utf-8');
            buffer.writeUInt8(nicknameBuffer.length, offset++);
            nicknameBuffer.copy(buffer, offset);
            offset += nicknameBuffer.length;

            buffer.writeUInt8(client.readyState, offset++);
        });

        const codeBuffer = Buffer.from(this.code, 'utf-8');
        buffer.writeUInt8(codeBuffer.length, offset++);
        codeBuffer.copy(buffer, offset);
        offset += codeBuffer.length;

        buffer.writeUInt8(this.biome, offset++);

        buffer.writeUInt8(this.state, offset++);

        buffer.writeUInt8(this.visible, offset++);

        return buffer;
    }

    public addPlayer(player: MockPlayerData): WaveRoomPlayerId | false {
        if (this.state !== WaveRoomState.Waiting) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        if (!this.isCandidateJoinable) {
            return false;
        }

        const id = generateRandomId<WaveRoomPlayerId>();

        // Ensure unique clientId
        if (this.roomCandidates.map(v => v.id).includes(id)) {
            return this.addPlayer(player);
        }

        this.roomCandidates.push({
            ...player,
            id,
            readyState: WaveRoomPlayerReadyState.Unready,
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
        if (this.state !== WaveRoomState.Waiting) {
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

    public setPlayerReadyState(id: WaveRoomPlayer["id"], state: WaveRoomPlayerReadyState): boolean {
        if (this.state !== WaveRoomState.Waiting) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        const index = this.roomCandidates.findIndex(p => p.id === id);
        if (index >= 0) {
            this.roomCandidates[index].readyState = state;

            logger.region(() => {
                using _guard = logger.metadata({ state: WaveRoomPlayerReadyState[state], waveClientId: id, code: this.code });
                logger.info("Player changed ready state");
            });

            return true;
        } else {
            return false;
        };
    }

    public setPublicState(id: WaveRoomPlayer["id"], state: WaveRoomVisibleState): boolean {
        if (this.state !== WaveRoomState.Waiting) {
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

    public setPlayerName(id: WaveRoomPlayer["id"], name: string): boolean {
        if (this.state !== WaveRoomState.Waiting) {
            return false;
        }

        using _disposable = this.onChangeAnything();

        const index = this.roomCandidates.findIndex(p => p.id === id);
        if (index >= 0) {
            this.roomCandidates[index].name = name;

            return true;
        } else {
            return false;
        };
    }

    private startWave() {
        this.state = WaveRoomState.Started;

        // Stop update packet send
        clearInterval(this.waveRoomPacketSendInterval);

        this.wavePool.startWave(this.roomCandidates);

        logger.region(() => {
            using _guard = logger.metadata({
                candidateIds: this.roomCandidates.map(c => c.id).join(","),
                code: this.code,
            });
            logger.info("Wave starting");
        });
    }

    private endWave() {
        this.state = WaveRoomState.Ended;

        // Stop wave update
        this.wavePool.endWave();

        logger.region(() => {
            using _guard = logger.metadata({ code: this.code });
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
        if (
            this.state === WaveRoomState.Waiting &&
            this.roomCandidates.length !== 0 &&
            this.roomCandidates.every(p => p.readyState === WaveRoomPlayerReadyState.Ready)
        ) {
            this.startWave();
        }

        if (this.state === WaveRoomState.Started && this.wavePool.getAllClients().every(p => p.isDead)) {
            this.endWave();
        }
    }

    /**
     * Proccess chat message.
     */
    public processChatMessage({ waveClientId }: UserData, chatMsg: string) {
        if (waveClientId && chatMsg.length > 0) {
            const player = this.wavePool.getClient(waveClientId);
            if (player && !player.isDead) {
                const size = parseInt(chatMsg);
                if (!isNaN(size)) {
                    player.size = Math.max(Player.BASE_SIZE, size);
                }
            }

            if (sha256(chatMsg) === process.env.TOGGLE_DEV_SALT) {
                player.isDev = !player.isDev;
            }

            // Publish chat
            this.wavePool.broadcastChat(waveClientId, chatMsg);
        }
    }

    /**
     * Determine if this wave room is joinable.
     */
    public get isCandidateJoinable() {
        return this.roomCandidates.length < WaveRoom.MAX_PLAYER_AMOUNT && this.state === WaveRoomState.Waiting;
    }
}