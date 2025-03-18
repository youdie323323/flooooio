import type { Biome } from "../../../../../../../Shared/Biome";
import type { WaveRoomPlayerReadyState, WaveRoomVisibleState } from "../../../../../../../Shared/WaveRoom";
import BinaryWriter from "../../../../../../../Shared/Websocket/Binary/ReadWriter/Writer/BinaryWriter";
import { PacketServerboundOpcode } from "../../../../../../../Shared/Websocket/Packet/Bound/Server/PacketServerboundOpcode";
import type ClientWebsocket from "../../../ClientWebsocket";

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

        writer.writeUInt8(PacketServerboundOpcode.WaveChangeMove);

        const normalizedAngle = getNormalizedAngle(angle);

        writer.writeUInt8(normalizedAngle);
        writer.writeUInt8(Math.round(magnitude * 255));

        this.send(writer.buffer);
    }

    public sendWaveChangeMood(flag: number) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveChangeMood);

        writer.writeUInt8(flag);

        this.send(writer.buffer);
    }

    public sendWaveSwapPetal(index: number) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveSwapPetal);

        writer.writeUInt8(index);

        this.send(writer.buffer);
    }

    public sendWaveChat(message: string) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveChat);

        writer.writeString(message);

        this.send(writer.buffer);
    }

    public sendWaveLeave() {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveLeave);

        this.send(writer.buffer);
    }

    public sendWaveRoomCreate(biome: Biome) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomCreate);

        writer.writeUInt8(biome);

        this.send(writer.buffer);
    }

    public sendWaveRoomJoin(code: string) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomJoin);

        writer.writeString(code);

        this.send(writer.buffer);
    }

    public sendWaveRoomFindPublic(biome: Biome) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomFindPublic);
        
        writer.writeUInt8(biome);

        this.send(writer.buffer);
    }

    public sendWaveRoomChangeReady(state: WaveRoomPlayerReadyState) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomChangeReady);

        writer.writeUInt8(state);

        this.send(writer.buffer);
    }

    public sendWaveRoomChangeVisible(state: WaveRoomVisibleState) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomChangeVisible);

        writer.writeUInt8(state);

        this.send(writer.buffer);
    }

    public sendWaveRoomChangeName(name: string) {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomChangeName);

        writer.writeString(name);

        this.send(writer.buffer);
    }

    public sendWaveRoomLeave() {
        const writer = new BinaryWriter();

        writer.writeUInt8(PacketServerboundOpcode.WaveRoomLeave);

        this.send(writer.buffer);
    }
}
