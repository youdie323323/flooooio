package game

type WaveRoomVisibility = byte

const (
	RoomVisibilityPublic WaveRoomVisibility = iota
	RoomVisibilityPrivate
)

var WaveRoomVisibilityValues = []WaveRoomVisibility{RoomVisibilityPublic, RoomVisibilityPrivate}
