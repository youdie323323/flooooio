export enum ServerBound {
    WaveChangeMove,
    WaveChangeMood,
    WaveSwapPetal,
    WaveChat,

    WaveRoomCreate,
    
    WaveRoomJoin,

    WaveRoomFindPublic,

    WaveRoomChangeReady,
    WaveRoomChangeVisible,
    WaveRoomChangeName,

    WaveRoomLeave,
    WaveLeave,
}

export enum ClientBound {
    WaveSelfId,
    WaveRoomSelfId,

    WaveUpdate,
    WaveRoomUpdate,

    WaveRoomJoinFailed,

    WaveStarting,

    WaveChatRecv,

    ConnectionKicked,
}

export enum ClientboundConnectionKickReason {
    OutdatedClient,
    AnticheatDetected,
}