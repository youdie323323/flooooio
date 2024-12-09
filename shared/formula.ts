import { memo } from "./utils/memoize";

/**
 * Memoized xp calculation by level.
 */
export const xpPerLevel = memo((level: number) => 25 * (Math.floor(level * Math.pow(1.05, level - 1))));

/**
 * Memoized level calculation by xp.
 */
export const levelPerXp = memo((xp: number) => {
    let level = 1;
    while (xpPerLevel(level) <= xp) level++;
    return level - 1;
});

/**
 * Calculate wave length.
 * 
 * @param x - Wave progress.
 */
export const calculateWaveLength = memo((x: number) => Math.max(60, x ** 0.2 * 18.9287 + 30));