package wave

type WaveRoomVisibility = byte

const (
	RoomVisibilityPublic WaveRoomVisibility = iota
	RoomVisibilityPrivate
)

var WaveRoomVisibilityValues = []WaveRoomVisibility{RoomVisibilityPublic, RoomVisibilityPrivate}
