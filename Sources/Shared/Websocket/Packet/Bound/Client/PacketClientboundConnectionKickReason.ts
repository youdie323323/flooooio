export const enum PacketClientboundConnectionKickReason {
    OutdatedClient,
    CheatDetected,
}

type DisplayConnectionKickReason = Capitalize<string>;

export const DISPLAY_KICK_REASON = {
    [PacketClientboundConnectionKickReason.OutdatedClient]: "Outdated client",
    [PacketClientboundConnectionKickReason.CheatDetected]: "Cheat detected",
} satisfies Record<PacketClientboundConnectionKickReason, DisplayConnectionKickReason>;