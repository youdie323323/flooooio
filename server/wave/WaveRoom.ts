import { Biomes } from "../../shared/biomes";
import { PacketKind } from "../../shared/packet";
import { EntityPool } from "../entity/EntityPool";
import { PlayerData, PlayerInstance } from "../entity/player/Player";
import { generateId } from "../entity/common/common";
import { logger } from "../main";
import WaveRoomManager from "./WaveRoomManager";

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

/** Extended player data with wave room specific properties */
export type WaveRoomPlayer = PlayerData & {
    id: number;
    isOwner: boolean;
    readyState: PlayerReadyState;
};

/** Update rate for broadcasting room state */
export const ROOM_UPDATE_FPS = 30;

export default class WaveRoom {
    public static readonly MAX_PLAYER_AMOUNT = 4;

    code: string;
    visible: WaveRoomVisibleState;
    state: WaveRoomState;
    biome: Biomes;
    roomCandidates: WaveRoomPlayer[];
    entityPool: EntityPool;

    updateInterval: NodeJS.Timeout;

    constructor(biome: Biomes, code: string) {
        this.visible = WaveRoomVisibleState.PUBLIC;
        this.state = WaveRoomState.WAITING;
        this.biome = biome;
        this.code = code;
        this.entityPool = new EntityPool(this);

        this.roomCandidates = new Array<WaveRoomPlayer>();

        this.updateInterval = setInterval(() => this.broadcastUpdatePacket(), 1000 / ROOM_UPDATE_FPS);
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

    public addPlayer(player: PlayerData): number | false {
        using _disposable = this.onChangeAnything();

        if (WaveRoom.MAX_PLAYER_AMOUNT <= this.roomCandidates.length) {
            return false;
        }

        const id = generateId();

        // Ensure unique clientId
        if (Array.from(this.roomCandidates.values()).map(v => v.id).includes(id)) {
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

    public removePlayer(id: number): boolean {
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
            if (savedIsOwner && this.roomCandidates.length > 0) {
                this.roomCandidates[0].isOwner = true;
            }

            return true;
        } else {
            return false;
        };
    }

    public setPlayerReadyState(id: number, state: PlayerReadyState): boolean {
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

    public setPublicState(id: number, state: WaveRoomVisibleState): boolean {
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
        this.entityPool.startWave(this);

        logger.region(() => {
            using _guard = logger.metadata({
                candidateIds: this.roomCandidates.map(c => c.id).join(","),
                code: this.code,
            });
            logger.info("Wave starting");
        });
    }

    private endWave() {
        // Stop wave update
        this.entityPool.endWave();

        logger.region(() => {
            using _guard = logger.metadata({ code: this.code });
            logger.info("Wave ended");
        });

        // We already checking this in waveRoomManager.leaveWaveRoom
        // this.waveRoomManager.removeWaveRoom(this);
    }

    public onChangeAnything = () => {
        const cacheThis = this;
        return {
            [Symbol.dispose]() {
                // cacheThis.roomCandidates.length !== 0 to prevent multiple wave start, before wave room deletion
                if (cacheThis.state === WaveRoomState.WAITING && cacheThis.roomCandidates.length !== 0 && cacheThis.roomCandidates.every(p => p.readyState === PlayerReadyState.READY)) {
                    cacheThis.startWave();
                }

                if (cacheThis.state === WaveRoomState.STARTED && cacheThis.roomCandidates.length !== 0 && cacheThis.entityPool.getAllClients().every(p => p.isDead)) {
                    cacheThis.state = WaveRoomState.END;
                }

                // cacheThis.state === WaveRoomState.STARTED for force ends while wave started
                if ((cacheThis.state === WaveRoomState.END || cacheThis.state === WaveRoomState.STARTED) && cacheThis.entityPool.clients.size === 0) {
                    cacheThis.endWave();
                }
            }
        };
    }
}