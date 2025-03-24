import type { Biome } from "../../../../../Shared/Biome";
import { WaveRoomPlayerReadyState, WaveRoomVisibleState, WaveRoomState } from "../../../../../Shared/WaveRoom";
import type { WaveRoomCode } from "../../../../../Shared/WaveRoomCode";
import BinarySizedWriter from "../../../../../Shared/Websocket/Binary/ReadWriter/Writer/BinarySizedWriter";
import { Clientbound } from "../../../../../Shared/Websocket/Packet/PacketDirection";
import { logger } from "../../../../Main";
import type { BrandedId } from "../../Entity/Dynamics/Entity";
import type { MobId } from "../../Entity/Dynamics/Mob/Mob";
import type { StaticPlayerData, PlayerId } from "../../Entity/Dynamics/Player/Player";
import { Player } from "../../Entity/Dynamics/Player/Player";
import type { UserData, WaveData } from "./WavePool";
import { WavePool } from "./WavePool";
import { createHash } from 'node:crypto';
import type uWS from 'uWebSockets.js';

export type WaveRoomPlayerId = BrandedId<"WaveRoomPlayer">;

/** Extended player data with wave room data properties */
export type WaveRoomPlayer = StaticPlayerData & {
    id: WaveRoomPlayerId;
    readyState: WaveRoomPlayerReadyState;
    isOwner: boolean;
};

export const WAVE_ROOM_UPDATE_SEND_FPS = 30;

function sha256(input: string): string {
    const hash = createHash("sha256");
    hash.update(input);

    return hash.digest("hex");
}

export const joinWaveRoom = (ws: uWS.WebSocket<UserData>, id: false | WaveRoomPlayerId): void => {
    const userData = ws.getUserData();
    if (!userData) return;

    const waveRoomJoinWriter = new BinarySizedWriter(
        id
            ? 5
            : 1,
    );

    waveRoomJoinWriter.writeUInt8(
        id
            ? Clientbound.WAVE_ROOM_SELF_ID
            : Clientbound.WAVE_ROOM_JOIN_FAILED,
    );

    if (id) {
        waveRoomJoinWriter.writeUInt32(id);

        userData.waveRoomClientId = id;
    }

    ws.send(waveRoomJoinWriter.buffer, true);
};

function randomUint32(): number {
    return Math.random() * 2 ** 32 >>> 0;
}

export function generateRandomId<T extends MobId | PlayerId | WaveRoomPlayerId>(): T {
    return randomUint32() as T;
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
        public roomCandidates: Array<WaveRoomPlayer> = new Array<WaveRoomPlayer>(),
    ) {
        this.waveRoomPacketSendInterval = setInterval(this.broadcastWaveRoomState.bind(this), 1000 / WAVE_ROOM_UPDATE_SEND_FPS);

        this.wavePool = new WavePool(
            this.initializeWaveData(),

            () => this.state,
            () => this.createStateChangeHandler(),
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
     * @returns - Constructed wave data
     */
    private initializeWaveData(): WaveData {
        return {
            progress: 37,
            progressTimer: 0,
            progressRedTimer: 0,
            progressIsRed: false,

            mapRadius: 5000,

            biome: this.biome,
        };
    }

    /**
     * Broadcasts the current room state to all players
     */
    private broadcastWaveRoomState() {
        const waveRoomStatePacket = this.createWaveRoomStatePacket();

        this.roomCandidates.forEach((player) => {
            player.ws.send(waveRoomStatePacket, true);
        });
    }

    private calculateWaveRoomStatePacketSize(): number {
        let size = 1 + 1 + (this.code.length + 1) + 1 + 1 + 1;

        this.roomCandidates.forEach(client => {
            size += 4 + (client.name.length + 1) + 1;
        });

        return size;
    }

    private createWaveRoomStatePacket(): Uint8Array {
        const waveRoomStateWriter = new BinarySizedWriter(this.calculateWaveRoomStatePacketSize());

        waveRoomStateWriter.writeUInt8(Clientbound.WAVE_ROOM_UPDATE);

        // Client count
        waveRoomStateWriter.writeUInt8(this.roomCandidates.length);

        this.roomCandidates.forEach(({ id, name, readyState }) => {
            waveRoomStateWriter.writeUInt32(id);

            // TODO: send static petal data too

            waveRoomStateWriter.writeString(name);

            waveRoomStateWriter.writeUInt8(readyState);
        });

        waveRoomStateWriter.writeString(this.code);

        waveRoomStateWriter.writeUInt8(this.biome);

        waveRoomStateWriter.writeUInt8(this.state);

        waveRoomStateWriter.writeUInt8(this.visible);

        return waveRoomStateWriter.buffer;
    }

    public registerPlayer(player: StaticPlayerData): WaveRoomPlayerId | false {
        if (this.state !== WaveRoomState.Waiting) return false;

        if (!this.newPlayerAcceptable) return false;

        using _disposable = this.createStateChangeHandler();

        const id = generateRandomId<WaveRoomPlayerId>();

        // Ensure unique clientId
        if (this.roomCandidates.map(v => v.id).includes(id)) {
            return this.registerPlayer(player);
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

    public unregisterPlayer(id: WaveRoomPlayerId): boolean {
        if (this.state !== WaveRoomState.Waiting) return false;

        using _disposable = this.createStateChangeHandler();

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
        }
    }

    public updatePlayerReadyState(id: WaveRoomPlayerId, state: WaveRoomPlayerReadyState): boolean {
        if (this.state !== WaveRoomState.Waiting) return false;

        using _disposable = this.createStateChangeHandler();

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
        }
    }

    public updateRoomVisibility(id: WaveRoomPlayerId, state: WaveRoomVisibleState): boolean {
        if (this.state !== WaveRoomState.Waiting) return false;

        const playerData = this.roomCandidates.find(p => p.id === id);
        if (!playerData?.isOwner) return false;

        using _disposable = this.createStateChangeHandler();

        this.visible = state;

        logger.region(() => {
            using _guard = logger.metadata({ state: WaveRoomVisibleState[state], waveClientId: id, code: this.code });
            logger.info("Player changed visible state");
        });

        return true;
    }

    public updatePlayerName(id: WaveRoomPlayerId, name: string): boolean {
        if (this.state !== WaveRoomState.Waiting) return false;

        using _disposable = this.createStateChangeHandler();

        const index = this.roomCandidates.findIndex(p => p.id === id);
        if (index >= 0) {
            this.roomCandidates[index].name = name;

            return true;
        } else {
            return false;
        }
    }

    private startWaveRoom() {
        this.state = WaveRoomState.Playing;

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

    private endWaveRoom() {
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
    public createStateChangeHandler(): Disposable {
        return { [Symbol.dispose]: () => this.checkAndUpdateGameState() };
    }

    /**
     * Checksum room values.
     */
    public checkAndUpdateGameState() {
        // this.roomCandidates.length !== 0 to prevent multiple wave start, before wave room deletion
        if (
            this.state === WaveRoomState.Waiting &&
            this.roomCandidates.length !== 0 &&
            this.roomCandidates.every(p => p.readyState === WaveRoomPlayerReadyState.Ready)
        ) {
            this.startWaveRoom();
        }

        if (
            this.state === WaveRoomState.Playing &&
            this.wavePool.getAllClients().every(p => p.isDead)
        ) {
            this.endWaveRoom();
        }
    }

    /**
     * Proccess chat message.
     */
    public handleChatMessage({ waveClientId }: UserData, chatMsg: string) {
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
    public get newPlayerAcceptable() {
        return this.roomCandidates.length < WaveRoom.MAX_PLAYER_AMOUNT &&
            this.state === WaveRoomState.Waiting;
    }
}