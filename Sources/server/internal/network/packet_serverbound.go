package network

// Serverbound packet opcodes.
const (
	ServerboundWaveChangeMove byte = iota
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
)