package network

// Clientbound packet opcodes.
const (
	ClientboundWaveSelfId byte = iota
	ClientboundWaveRoomSelfId

	ClientboundWaveUpdate
	ClientboundWaveRoomUpdate

	ClientboundWaveRoomJoinFailed

	ClientboundWaveStarted

	ClientboundWaveChatReceiv

	ClientboundConnectionKicked
)