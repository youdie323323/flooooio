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
export const calculateWaveLength = (x: number) => Math.max(60, x ** 0.2 * 18.9287 + 30);

// Lazy constants for computeLootChance

const dropS = [
    0,
    0.8589559816476924,
    0.9963889387113232,
    0.9998247626379139,
    0.9999965538342435,
    0.9999999896581699,
    0.9999999999656417,
    1,
];

const mobS = [
    60000,
    15000,
    1500,
    100,
    5,
    0.1,
    0.005,
    0.00001,
    0.000001
];

/**
 * Calculates petal drop rate chance.
 * 
 * @param baseDropChance - Chance of drop, range to 0~1.
 */
export const calculateDropChance = (baseDropChance: number, mobRarity: number, dropRarity: number): number => {
    const cap = Math.max(1, mobRarity);
    if (dropRarity > cap || dropRarity > 6) return 0;

    const start = dropS[dropRarity],
        end = dropRarity === cap ? 1 : dropS[dropRarity + 1];

    const powTerm1 = Math.pow(baseDropChance * start + (1 - baseDropChance), 300000 / mobS[mobRarity]),
        powTerm2 = Math.pow(baseDropChance * end + (1 - baseDropChance), 300000 / mobS[mobRarity]);

    return powTerm2 - powTerm1;
}