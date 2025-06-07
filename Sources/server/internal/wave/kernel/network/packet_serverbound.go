package network

// Serverbound packet opcodes.
const (
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