"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDropTable = exports.calculateDropChance = exports.rarityTable = exports.RELATIVE_RARITY = exports.levelPerXp = exports.xpPerLevel = void 0;
const Rarity_1 = require("./Rarity");
/**
 * Memoized xp calculation by level.
 */
const xpPerLevel = (level) => 25 * (Math.floor(level * Math.pow(1.05, level - 1)));
exports.xpPerLevel = xpPerLevel;
/**
 * Memoized level calculation by xp.
 */
const levelPerXp = (xp) => {
    let level = 1;
    while ((0, exports.xpPerLevel)(level) <= xp)
        level++;
    return level - 1;
};
exports.levelPerXp = levelPerXp;
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
exports.RELATIVE_RARITY = [
    60000, // Common
    15000, // Unusual
    2500, // Rare
    100, // Epic
    5, // Legendary
    0.1, // Mythic
    0.001, // Ultra
];
exports.rarityTable = (() => {
    const table = new Array(exports.RELATIVE_RARITY.length).fill(0);
    const totalWeight = exports.RELATIVE_RARITY.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (let i = 0; i < table.length; i++) {
        table[i] = acc / totalWeight;
        acc += exports.RELATIVE_RARITY[i];
    }
    return table;
})();
/**
 * Calculates petal drop rate chance.
 *
 * @remarks
 * Completely same as florrio.utils.calculateDropChance (not same RELATIVE_RARITY).
 *
 * @param baseDropChance - Chance of drop, range to 0 ~ 1
 */
const calculateDropChance = (baseDropChance, mobRarity, dropRarity) => {
    const cap = Math.max(1, mobRarity);
    if (dropRarity > cap || dropRarity > MAX_DROPPABLE_RARITY)
        return 0;
    const start = exports.rarityTable[dropRarity], end = dropRarity === cap
        ? 1
        : exports.rarityTable[dropRarity + 1];
    const powTerm1 = Math.pow(baseDropChance * start + (1 - baseDropChance), 300000 / exports.RELATIVE_RARITY[mobRarity]), powTerm2 = Math.pow(baseDropChance * end + (1 - baseDropChance), 300000 / exports.RELATIVE_RARITY[mobRarity]);
    return powTerm2 - powTerm1;
};
exports.calculateDropChance = calculateDropChance;
const MAX_DROPPABLE_RARITY = 5 /* Rarity.MYTHIC */;
const calculateDropTable = (baseDropChance) => {
    const table = Array.from({ length: Rarity_1.MAX_RARITIES }, () => new Array(MAX_DROPPABLE_RARITY).fill(0));
    for (let mob = 0; mob < Rarity_1.MAX_RARITIES; mob++) {
        for (let drop = 0; drop <= MAX_DROPPABLE_RARITY; drop++) {
            table[mob][drop] = (0, exports.calculateDropChance)(baseDropChance, mob, drop);
        }
    }
    return table;
};
exports.calculateDropTable = calculateDropTable;
