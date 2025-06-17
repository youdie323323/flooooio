/**
 * Mood bit flag.
 * 
 * @privateremarks
 * According to microsoft, enum name should be plural :).
 */
export const enum MoodFlags {
    ANGRY = 0,
    SAD = 1,
}

export function decodeMood(flags: number) {
    return [
        // Is angry
        (flags & MoodFlags.ANGRY) !== 0,
        // Is sad
        (flags & MoodFlags.SAD) !== 0,
    ] as const;
}