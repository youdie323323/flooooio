package network

type ConnectionKickReason uint

const (
	OutdatedClient ConnectionKickReason = iota
	CheatDetected
)

var DisplayKickReasons = map[ConnectionKickReason]string{
	OutdatedClient: "Outdated client",
	CheatDetected: "Cheat detected",
}