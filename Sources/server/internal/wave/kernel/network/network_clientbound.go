package network

// Clientbound packet opcodes.
const (
	ClientboundWaveSelfId Opcode = iota
	ClientboundWaveRoomSelfId

	ClientboundWaveUpdate
	ClientboundWaveRoomUpdate

	ClientboundWaveRoomJoinFailed

	ClientboundWaveStarted

	ClientboundWaveChatReceive

	ClientboundConnectionKicked
)
