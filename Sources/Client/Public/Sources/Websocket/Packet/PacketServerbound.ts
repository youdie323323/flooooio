import type { WaveRoomPlayerReadyState, WaveRoomVisibleState } from "../../../../Private/Sources/Wave/WaveRoom";
import type { Biome } from "../../Native/Biome";
import BinaryWriter from "../Binary/ReadWriter/Writer/BinaryWriter";
import type ClientWebsocket from "../ClientWebsocket";
import { Serverbound } from "./PacketOpcode";

const TAU = Math.PI * 2;

function getNormalizedAngle(angle: number): number {
    angle %= TAU;
    if (angle < 0) {
        angle += TAU;
    }

    return Math.round(angle / TAU * 255);
}

export default class PacketServerbound {
    constructor(private clientWebSocket: ClientWebsocket) { }

    private send(data: Parameters<WebSocket["send"]>[0]) {
        if (this.clientWebSocket.socket?.readyState !== WebSocket.OPEN) {
            throw new Error("Cannot send a buffer");
        }

        this.clientWebSocket.socket.send(data);
    }

    public sendWaveChangeMove(angle: number, magnitude: number) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_CHANGE_MOVE);

        const normalizedAngle = getNormalizedAngle(angle);

        writer.writeUInt8(normalizedAngle);
        writer.writeUInt8(Math.round(magnitude * 255));

        this.send(writer.buffer);
    }

    public sendWaveChangeMood(flag: number) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_CHANGE_MOOD);

        writer.writeUInt8(flag);

        this.send(writer.buffer);
    }

    public sendWaveSwapPetal(index: number) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_SWAP_PETAL);

        writer.writeUInt8(index);

        this.send(writer.buffer);
    }

    public sendWaveChat(message: string) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_SEND_CHAT);

        writer.writeString(message);

        this.send(writer.buffer);
    }

    public sendWaveLeave() {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_LEAVE);

        this.send(writer.buffer);
    }

    public sendWaveRoomCreate(biome: Biome) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_CREATE);

        writer.writeUInt8(biome);

        this.send(writer.buffer);
    }

    public sendWaveRoomJoin(code: string) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_JOIN);

        writer.writeString(code);

        this.send(writer.buffer);
    }

    public sendWaveRoomFindPublic(biome: Biome) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_FIND_PUBLIC);
        
        writer.writeUInt8(biome);

        this.send(writer.buffer);
    }

    public sendWaveRoomChangeReady(state: WaveRoomPlayerReadyState) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_CHANGE_READY);

        writer.writeUInt8(state);

        this.send(writer.buffer);
    }

    public sendWaveRoomChangeVisible(state: WaveRoomVisibleState) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_CHANGE_VISIBLE);

        writer.writeUInt8(state);

        this.send(writer.buffer);
    }

    public sendWaveRoomChangeName(name: string) {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_CHANGE_NAME);

        writer.writeString(name);

        this.send(writer.buffer);
    }

    public sendWaveRoomLeave() {
        const writer = new BinaryWriter();

        writer.writeUInt8(Serverbound.WAVE_ROOM_LEAVE);

        this.send(writer.buffer);
    }
}
