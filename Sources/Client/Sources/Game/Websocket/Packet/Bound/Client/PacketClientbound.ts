import type { ReadableDataType } from "../../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import BinaryReader from "../../../../../../../Shared/Websocket/Binary/ReadWriter/Reader/BinaryReader";
import { PacketClientboundConnectionKickReason } from "../../../../../../../Shared/Websocket/Packet/Bound/Client/PacketClientboundConnectionKickReason";
import { PacketClientboundOpcode } from "../../../../../../../Shared/Websocket/Packet/Bound/Client/PacketClientboundOpcode";
import type ClientWebsocket from "../../../ClientWebsocket";

export type StaticAdditionalClientboundListen = Partial<Record<PacketClientboundOpcode, (reader: BinaryReader) => void>>;

export type DynamicAdditionalClientboundListen = () => StaticAdditionalClientboundListen;

export type AdditionalClientboundListen = StaticAdditionalClientboundListen | DynamicAdditionalClientboundListen;

export default class PacketClientbound {
    /**
     * @param _additionalClientboundListen - Additional listener function to custom game
     */
    constructor(
        public clientWebSocket: ClientWebsocket,
        private _additionalClientboundListen: AdditionalClientboundListen = {},
    ) { }

    public read(data: ReadableDataType) {
        const reader = new BinaryReader(data);

        const opcode = reader.readUInt8() satisfies PacketClientboundOpcode;

        const listen = this.computeAdditionalClientboundListen(this._additionalClientboundListen);
        if (listen.hasOwnProperty(opcode)) {
            listen[opcode](reader);

            return;
        }

        switch (opcode) {
            case PacketClientboundOpcode.ConnectionKicked: {
                this.readPacketConnectionKick(reader);

                break;
            }
        }
    }

    private computeAdditionalClientboundListen(listen: AdditionalClientboundListen): StaticAdditionalClientboundListen {
        if (listen instanceof Function) {
            return listen();
        } else {
            return listen;
        }
    }

    public readPacketConnectionKick(reader: BinaryReader) {
        const kickReasonKind = reader.readUInt8();

        this.clientWebSocket.destroy();

        switch (kickReasonKind) {
            case PacketClientboundConnectionKickReason.OutdatedClient: {
                setTimeout(() => {
                    location.reload();
                }, 500);

                break;
            }
        }
    }
}