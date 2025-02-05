import { NUM_RARITIES, Rarities } from "./rarity";
import { memo } from "./Utils/memoize";

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

// Lazy constant for computeLootChance

/*
[
    60000,
    15000,
    1500,
    100,
    5,
    0.1,
    0.005,
    0.00001,
    0.000001
]
TODO: determine which relativeRarity to use
I think table above is good for petal
*/
export const relativeRarity = [
    60000, // Common
    15000, // Unusual
    2500,  // Rare
    100,   // Epic
    5,     // Legendary
    0.1,   // Mythic
    0.001, // Ultra
];

export const rarityTable = (() => {
    const table = new Array<number>(relativeRarity.length).fill(0);
    const totalWeight = relativeRarity.reduce((a, b) => a + b, 0);

    let acc = 0;
    for (let i = 0; i < table.length; i++) {
        table[i] = acc / totalWeight;
        acc += relativeRarity[i];
    }
    return table;
})();

/**
 * Calculates petal drop rate chance.
 * 
 * @remarks
 * 
 * Completely same as florrio.utils.calculateDropChance.
 * 
 * @param baseDropChance - Chance of drop, range to 0~1.
 */
export const calculateDropChance = (baseDropChance: number, mobRarity: number, dropRarity: number): number => {
    const cap = Math.max(1, mobRarity);
    if (dropRarity > cap || dropRarity > MAX_DROPPABLE_RARITY) return 0;

    const start = rarityTable[dropRarity],
        end = dropRarity === cap ? 1 : rarityTable[dropRarity + 1];

    const powTerm1 = Math.pow(baseDropChance * start + (1 - baseDropChance), 300000 / relativeRarity[mobRarity]),
        powTerm2 = Math.pow(baseDropChance * end + (1 - baseDropChance), 300000 / relativeRarity[mobRarity]);

    return powTerm2 - powTerm1;
}

const MAX_DROPPABLE_RARITY = Rarities.Mythic;

export const calculateDropTable = (baseDropChance: number): number[][] => {
    const table = Array.from({ length: NUM_RARITIES }, () => new Array(MAX_DROPPABLE_RARITY).fill(0));

    for (let mob = 0; mob < NUM_RARITIES; mob++) {
        for (let drop = 0; drop <= MAX_DROPPABLE_RARITY; drop++) {
            table[mob][drop] = calculateDropChance(baseDropChance, mob, drop);
        }
    }

    return table;
}