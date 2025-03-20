import type { ReadableDataType } from "../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import BinaryReader from "../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { Clientbound, ClientboundConnectionKickReason } from "../../../../../../Shared/Websocket/Packet/PacketDirection";
import type ClientWebsocket from "../ClientWebsocket";

export type StaticAdherableClientboundHandler = Readonly<Partial<Record<Clientbound, (reader: BinaryReader) => void>>>;

export type DynamicAdherableClientboundHandler = () => StaticAdherableClientboundHandler;

export type AdherableClientboundHandler = StaticAdherableClientboundHandler | DynamicAdherableClientboundHandler;

export default class PacketClientbound {
    /**
     * @param clientboundHandler - Additional listener function to custom game
     */
    constructor(
        private clientWebSocket: ClientWebsocket,
        private clientboundHandler: AdherableClientboundHandler = {},
    ) { }

    public read(data: ReadableDataType) {
        const reader = new BinaryReader(data);

        const opcode = reader.readUInt8() satisfies Clientbound;

        const listen = this.computeAdditionalClientboundListen(this.clientboundHandler);
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

    private computeAdditionalClientboundListen(listen: AdherableClientboundHandler): StaticAdherableClientboundHandler {
        return listen instanceof Function ? listen() : listen;
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