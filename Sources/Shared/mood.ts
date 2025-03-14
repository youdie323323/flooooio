/**
 * Mood bit flag.
 * 
 * @privateremarks
 * According to microsoft, enum name should be plural :).
 */
export const enum MoodFlags {
    Normal = 0,
    Angry = 1 << 0,  // 1
    Sad = 1 << 1,    // 2
}

export const VALID_MOOD_FLAGS = [
    MoodFlags.Normal,
    MoodFlags.Angry,
    MoodFlags.Sad,
    MoodFlags.Angry | MoodFlags.Sad,
];

export function decodeMood(flags: number): [
    // Is angry
    boolean, 
    // Is sad
    boolean,
] {
    return [
        (flags & MoodFlags.Angry) !== 0,
        (flags & MoodFlags.Sad) !== 0,
    ];
}