"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PacketClientbound_1 = __importDefault(require("./Packet/PacketClientbound"));
const PacketServerbound_1 = __importDefault(require("./Packet/PacketServerbound"));
class ClientWebsocket {
    constructor(additionalClientboundListen = {}) {
        this.socket = null;
        this.packetServerbound = new PacketServerbound_1.default(this);
        this.packetClientbound = new PacketClientbound_1.default(this, additionalClientboundListen);
        this.hasBeenDestroyed = false;
        this.clear();
    }
    clear() { }
    connect() {
        this.socket = new WebSocket(location.protocol.replace("http", "ws") + "//" + location.host + "/ws");
        this.socket.binaryType = "arraybuffer";
        this.socket.addEventListener("open", () => {
            this.onConnect();
        });
        this.socket.addEventListener("close", () => {
            this.clear();
            // Unintended close, reconnect
            if (!this.hasBeenDestroyed) {
                setTimeout(() => {
                    this.connect();
                }, 500);
            }
        });
        this.socket.addEventListener("message", ({ data }) => {
            if (!(data instanceof ArrayBuffer)) {
                return;
            }
            data = new Uint8Array(data);
            this.packetClientbound.read(data);
        });
    }
    destroy() {
        this.hasBeenDestroyed = true;
        this.socket.close();
    }
    onConnect() { }
}
exports.default = ClientWebsocket;
