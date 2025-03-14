export const enum PacketClientboundOpcode {
    WaveSelfId,
    WaveRoomSelfId,

    WaveUpdate,
    WaveRoomUpdate,

    WaveRoomJoinFailed,

    WaveStarted,

    WaveChatReceiv,

    ConnectionKicked,
}