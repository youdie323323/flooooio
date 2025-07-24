package network

type Opcode = uint8

const ( // Clientbound packet opcodes.
	ClientboundWaveSelfId Opcode = iota
	ClientboundWaveRoomSelfId

	ClientboundWaveUpdate
	ClientboundWaveRoomUpdate

	ClientboundWaveRoomJoinFailed

	ClientboundWaveStarted

	ClientboundWaveChatReceive

	ClientboundConnectionKicked
)

const ( // Serverbound packet opcodes.
	ServerboundWaveChangeMove Opcode = iota
	ServerboundWaveChangeMood
	ServerboundWaveSwapPetal

	ServerboundWaveChat

	ServerboundWaveRoomCreate

	ServerboundWaveRoomJoin

	ServerboundWaveRoomFindPublic

	ServerboundWaveRoomChangeReady
	ServerboundWaveRoomChangeVisible
	ServerboundWaveRoomChangeName

	ServerboundWaveLeave
	ServerboundWaveRoomLeave

	ServerboundAck
)
