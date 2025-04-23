package wave

type WaveRoomState = byte

const (
	RoomStateWaiting WaveRoomState = iota
	RoomStatePlaying
	RoomStateEnded
)

var WaveRoomStateValues = []WaveRoomVisibility{RoomStateWaiting, RoomStatePlaying, RoomStateEnded}
