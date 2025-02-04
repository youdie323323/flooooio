/**
 * Mood bit flag.
 */
export enum Mood {
    NORMAL = 0,
    ANGRY = 1 << 0,  // 1
    SAD = 1 << 1,    // 2
}

export const MOOD_VALUES = Object.values(Mood);

export const VALID_MOOD_FLAGS = [
    Mood.NORMAL,
    Mood.ANGRY,
    Mood.SAD,
    Mood.ANGRY | Mood.SAD
];

export function decodeMood(flags: number): [boolean, boolean] {
    return [
        (flags & Mood.ANGRY) !== 0,
        (flags & Mood.SAD) !== 0
    ];
}