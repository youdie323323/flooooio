export const enum ClientboundConnectionKickReason {
    OutdatedClient,
    CheatDetected,
}

type DisplayKickReason = Capitalize<string>;

export const DISPLAY_KICK_REASON = {
    [ClientboundConnectionKickReason.OutdatedClient]: "Outdated client",
    [ClientboundConnectionKickReason.CheatDetected]: "Cheat detected",
} satisfies Record<ClientboundConnectionKickReason, DisplayKickReason>;