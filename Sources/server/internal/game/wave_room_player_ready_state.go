package game

type PlayerState = byte

const (
	PlayerStateNotReady PlayerState = iota
	PlayerStateReady
)

var PlayerStateValues = []WaveRoomVisibility{PlayerStateNotReady, PlayerStateReady}
