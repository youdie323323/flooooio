import type { ReadableDataType } from "../Binary/ReadWriter/Reader/BinaryReader";
import BinaryReader from "../Binary/ReadWriter/Reader/BinaryReader";
import type ClientWebsocket from "../ClientWebsocket";
import { Clientbound, ClientboundConnectionKickReason } from "./PacketOpcode";

export type StaticAdheredClientboundHandlers = Partial<Readonly<Record<Clientbound, (reader: BinaryReader) => void>>>;

export type DynamicAdheredClientboundHandlers = () => StaticAdheredClientboundHandlers;

export type AdheredClientboundHandlers = StaticAdheredClientboundHandlers | DynamicAdheredClientboundHandlers;

export default class PacketClientbound {
    /**
     * @param adheredClientboundHandlers - Additional listener function to custom game
     */
    constructor(
        private clientWebSocket: ClientWebsocket,
        private adheredClientboundHandlers: AdheredClientboundHandlers = {},
    ) { }

    public read(data: ReadableDataType) {
        const reader = new BinaryReader(data);

        const opcode = reader.readUInt8() satisfies Clientbound;

        const listen = this.computeAdheredClientboundHandlers(this.adheredClientboundHandlers);
        if (listen.hasOwnProperty(opcode)) {
            listen[opcode](reader);

            return;
        }

        switch (opcode) {
            case Clientbound.CONNECTION_KICKED: {
                this.readPacketConnectionKick(reader);

                break;
            }
        }
    }

    private computeAdheredClientboundHandlers(handlers: AdheredClientboundHandlers): StaticAdheredClientboundHandlers {
        return handlers instanceof Function ? handlers() : handlers;
    }

    public readPacketConnectionKick(reader: BinaryReader) {
        const kickReasonKind = reader.readUInt8();

        this.clientWebSocket.destroy();

        switch (kickReasonKind) {
            case ClientboundConnectionKickReason.OUTDATED_CLIENT: {
                setTimeout(() => {
                    location.reload();
                }, 500);

                break;
            }
        }
    }
}