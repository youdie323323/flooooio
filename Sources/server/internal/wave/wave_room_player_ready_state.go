package wave

type RoomPlayerReadyState = byte

const (
	RoomPlayerReadyStateNotReady RoomPlayerReadyState = iota
	RoomPlayerReadyStateReady
)

var RoomPlayerReadyStateValues = []RoomVisibility{RoomPlayerReadyStateNotReady, RoomPlayerReadyStateReady}
