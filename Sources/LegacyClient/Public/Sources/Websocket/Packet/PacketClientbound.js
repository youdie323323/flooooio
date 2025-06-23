"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryReader_1 = __importDefault(require("../Binary/ReadWriter/Reader/BinaryReader"));
class PacketClientbound {
    /**
     * @param adheredClientboundHandlers - Additional listener function to custom game
     */
    constructor(clientWebSocket, adheredClientboundHandlers = {}) {
        this.clientWebSocket = clientWebSocket;
        this.adheredClientboundHandlers = adheredClientboundHandlers;
    }
    read(data) {
        const reader = new BinaryReader_1.default(data);
        const opcode = reader.readUInt8();
        const listen = this.computeAdheredClientboundHandlers(this.adheredClientboundHandlers);
        if (listen.hasOwnProperty(opcode)) {
            listen[opcode](reader);
            return;
        }
        switch (opcode) {
            case 7 /* Clientbound.CONNECTION_KICKED */: {
                this.readPacketConnectionKick(reader);
                break;
            }
        }
    }
    computeAdheredClientboundHandlers(handlers) {
        return handlers instanceof Function ? handlers() : handlers;
    }
    readPacketConnectionKick(reader) {
        const kickReasonKind = reader.readUInt8();
        this.clientWebSocket.destroy();
        switch (kickReasonKind) {
            case 0 /* ClientboundConnectionKickReason.OUTDATED_CLIENT */: {
                setTimeout(() => {
                    location.reload();
                }, 500);
                break;
            }
        }
    }
}
exports.default = PacketClientbound;
