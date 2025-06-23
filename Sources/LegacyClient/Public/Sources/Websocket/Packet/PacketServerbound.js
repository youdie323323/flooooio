"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryWriter_1 = __importDefault(require("../Binary/ReadWriter/Writer/BinaryWriter"));
const TAU = 2 * Math.PI;
function getNormalizedAngle(angle) {
    angle %= TAU;
    if (angle < 0) {
        angle += TAU;
    }
    return Math.round(angle / TAU * 255);
}
class PacketServerbound {
    constructor(clientWebSocket) {
        this.clientWebSocket = clientWebSocket;
    }
    send(data) {
        if (this.clientWebSocket.socket?.readyState !== WebSocket.OPEN) {
            throw new Error("Cannot send a buffer");
        }
        this.clientWebSocket.socket.send(data);
    }
    sendWaveChangeMove(angle, magnitude) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(0 /* Serverbound.WAVE_CHANGE_MOVE */);
        const normalizedAngle = getNormalizedAngle(angle);
        writer.writeUInt8(normalizedAngle);
        writer.writeUInt8(Math.round(magnitude * 255));
        this.send(writer.buffer);
    }
    sendWaveChangeMood(flag) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(1 /* Serverbound.WAVE_CHANGE_MOOD */);
        writer.writeUInt8(flag);
        this.send(writer.buffer);
    }
    sendWaveSwapPetal(index) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(2 /* Serverbound.WAVE_SWAP_PETAL */);
        writer.writeUInt8(index);
        this.send(writer.buffer);
    }
    sendWaveChat(message) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(3 /* Serverbound.WAVE_SEND_CHAT */);
        writer.writeString(message);
        this.send(writer.buffer);
    }
    sendWaveLeave() {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(10 /* Serverbound.WAVE_LEAVE */);
        this.send(writer.buffer);
    }
    sendWaveRoomCreate(biome) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(4 /* Serverbound.WAVE_ROOM_CREATE */);
        writer.writeUInt8(biome);
        this.send(writer.buffer);
    }
    sendWaveRoomJoin(code) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(5 /* Serverbound.WAVE_ROOM_JOIN */);
        writer.writeString(code);
        this.send(writer.buffer);
    }
    sendWaveRoomFindPublic(biome) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(6 /* Serverbound.WAVE_ROOM_FIND_PUBLIC */);
        writer.writeUInt8(biome);
        this.send(writer.buffer);
    }
    sendWaveRoomChangeReady(state) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(7 /* Serverbound.WAVE_ROOM_CHANGE_READY */);
        writer.writeUInt8(state);
        this.send(writer.buffer);
    }
    sendWaveRoomChangeVisible(state) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(8 /* Serverbound.WAVE_ROOM_CHANGE_VISIBLE */);
        writer.writeUInt8(state);
        this.send(writer.buffer);
    }
    sendWaveRoomChangeName(name) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(9 /* Serverbound.WAVE_ROOM_CHANGE_NAME */);
        writer.writeString(name);
        this.send(writer.buffer);
    }
    sendWaveRoomLeave() {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(11 /* Serverbound.WAVE_ROOM_LEAVE */);
        this.send(writer.buffer);
    }
    sendAck([width, height]) {
        const writer = new BinaryWriter_1.default();
        writer.writeUInt8(12 /* Serverbound.ACK */);
        writer.writeUInt16(width);
        writer.writeUInt16(height);
        this.send(writer.buffer);
    }
}
exports.default = PacketServerbound;
