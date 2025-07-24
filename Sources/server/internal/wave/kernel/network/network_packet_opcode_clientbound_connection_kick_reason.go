package network

type ConnectionKickReason uint

const (
	ConnectionKickReasonOutdatedClient ConnectionKickReason = iota
	ConnectionKickReasonCheatDetected
)

var DisplayConnectionKickReasons = map[ConnectionKickReason]string{
	ConnectionKickReasonOutdatedClient: "Outdated client",
	ConnectionKickReasonCheatDetected:  "Cheat detected",
}
