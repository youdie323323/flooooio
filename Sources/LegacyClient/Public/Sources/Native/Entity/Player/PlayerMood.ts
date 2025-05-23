/**
 * Mood bit flag.
 * 
 * @privateremarks
 * According to microsoft, enum name should be plural :).
 */
export const enum MoodFlags {
    NORMAL = 0,
    ANGRY = 1 << 0,  // 1
    SAD = 1 << 1,    // 2
}

export function decodeMood(flags: number) {
    return [
        // Is angry
        (flags & MoodFlags.ANGRY) !== 0,
        // Is sad
        (flags & MoodFlags.SAD) !== 0,
    ] as const;
}