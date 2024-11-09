import { Biomes } from "../../shared/biomes";
import { PacketKind } from "../../shared/packet";
import { EntityPool } from "../entity/EntityPool";
import { PlayerData, PlayerInstance } from "../entity/player/Player";
import { generateId } from "../entity/utils/common";

export enum WaveState {
    WAITING,
    STARTED,
    END,
}

export enum PlayerReadyState {
    UNREADY,
    READY,
}

export type WaveRoomPlayer = PlayerData & Required<{
    id: number;
    isOwner: boolean;
    state: PlayerReadyState;
}>;

export const ROOM_UPDATE_FPS = 15;

export default class WaveRoom {
    public static readonly MAX_PLAYER_AMOUNT = 4;

    code: string;
    public: boolean;
    state: WaveState;
    biome: Biomes;
    roomPlayers: WaveRoomPlayer[];
    entityPool: EntityPool;

    updater: NodeJS.Timeout;

    constructor(biome: Biomes, code: string) {
        this.code = code;
        this.public = false;
        this.state = WaveState.WAITING;
        this.biome = biome;
        this.entityPool = new EntityPool();

        this.roomPlayers = new Array<WaveRoomPlayer>();

        this.updater = setInterval(() => this.broadcastUpdatePacket(), 1000 / ROOM_UPDATE_FPS)
    }

    private broadcastUpdatePacket() {
        const waveClientsPacket = this.createWaveClientsPacket();

        this.roomPlayers.forEach((player) => {
            if (player?.ws) {
                player.ws.send(waveClientsPacket, true);
            }
        });
    }

    private calculateWaveClientsPacketSize(): number {
        let size = 1 + 1 + (this.code.length + 1) + 1 + 1 + 1;
        this.roomPlayers.forEach(client => {
            size += 4 + 1 + 1 + client.name.length;
        });
        return size;
    }

    private createWaveClientsPacket() {
        const size = this.calculateWaveClientsPacketSize();
        const buffer = Buffer.alloc(size);
        let offset = 0;

        buffer.writeUInt8(PacketKind.WAVE_UPDATE, offset++);

        // Client count
        buffer.writeUInt8(this.roomPlayers.length, offset++);

        this.roomPlayers.forEach(client => {
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

        buffer.writeUInt8(this.public ? 1 : 0, offset++);

        return buffer;
    }

    public addPlayer(player: PlayerData): number | false {
        using _disposable = this.onChangeSomething();

        if (WaveRoom.MAX_PLAYER_AMOUNT >= this.roomPlayers.length) {
            return false;
        }

        const waveClientId = generateId();

        // Ensure unique clientId
        if (Array.from(this.roomPlayers.values()).map(v => v.id).includes(waveClientId)) {
            return this.addPlayer(player);
        }

        this.roomPlayers.push({
            ...player,
            id: waveClientId,
            state: PlayerReadyState.UNREADY,
            // First player is owner
            isOwner: this.roomPlayers.length === 0,
        });

        return waveClientId;
    }

    public removePlayer(id: number): boolean {
        using _disposable = this.onChangeSomething();

        const index = this.roomPlayers.findIndex(p => p.id === id);
        if (index >= 0) {
            this.roomPlayers.splice(index, 1);
            if (this.roomPlayers[index]?.isOwner && this.roomPlayers.length > 0) {
                this.roomPlayers[0].isOwner = true;
            }
            return true;
        } else {
            return false;
        };
    }

    public setPlayerReadyState(id: number, state: PlayerReadyState): boolean {
        using _disposable = this.onChangeSomething();

        const index = this.roomPlayers.findIndex(p => p.id === id);
        if (index >= 0) {
            this.roomPlayers[index].state = state;
            return true;
        } else {
            return false;
        };
    }

    public setPublicState(id: number, _public: boolean) {
        using _disposable = this.onChangeSomething();

        const playerData = this.roomPlayers.find(p => p.id === id);
        if (!playerData?.isOwner) {
            return false;
        }

        this.public = _public;
        return true;
    }

    private onChangeSomething = () => {
        const cacheThis = this;
        return {
            [Symbol.dispose]() {
                if (cacheThis.state === WaveState.STARTED && cacheThis.entityPool.getAllClients().every(p => p.isDead)) {
                    cacheThis.state = WaveState.END;
                }

                // This condition will do once
                if (cacheThis.state === WaveState.WAITING && cacheThis.roomPlayers.every(p => p.state === PlayerReadyState.READY)) {
                    cacheThis.state = WaveState.STARTED;
                    clearInterval(cacheThis.updater);
                    cacheThis.entityPool.startWave(cacheThis.roomPlayers);
                }
            }
        };
    }
}