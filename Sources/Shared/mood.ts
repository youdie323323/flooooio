/**
 * Mood bit flag.
 */
export enum Mood {
    Normal = 0,
    Angry = 1 << 0,  // 1
    Sad = 1 << 1,    // 2
}

export const MOOD_VALUES = Object.values(Mood);

export const VALID_MOOD_FLAGS = [
    Mood.Normal,
    Mood.Angry,
    Mood.Sad,
    Mood.Angry | Mood.Sad
];

export function decodeMood(flags: number): [boolean, boolean] {
    return [
        (flags & Mood.Angry) !== 0,
        (flags & Mood.Sad) !== 0
    ];
}