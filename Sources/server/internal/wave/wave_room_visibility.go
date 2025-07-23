package wave

type RoomVisibility = byte

const (
	RoomVisibilityPublic RoomVisibility = iota
	RoomVisibilityPrivate
)

var RoomVisibilityValues = []RoomVisibility{RoomVisibilityPublic, RoomVisibilityPrivate}
