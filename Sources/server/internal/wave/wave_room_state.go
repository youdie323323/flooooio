package wave

type RoomState = byte

const (
	RoomStateWaiting RoomState = iota
	RoomStatePlaying
	RoomStateEnded
)

var RoomStateValues = []RoomVisibility{RoomStateWaiting, RoomStatePlaying, RoomStateEnded}
