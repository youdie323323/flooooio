import { Rarities } from "../../../shared/rarities";
import { MOB_DAMAGE_FACTOR } from "../mob/Mob";

/**
 * Calculate required xp by level.
 */
export const xpPerLevel = (level: number) => 25 * (Math.floor(level * Math.pow(1.05, level - 1)));

export const GENERATE_DROP_RATE_TABLE = (n: number) => {
    const mobS = [60000, 15000, 2500, 100, 5, 0.1, 0.003];
    const dropS = [0, 0.6932697314296992, 0.9705776240015788, 0.9983084132587667, 0.9999722606141981, 0.9999999914034552, 0.9999999997226992];
    const ret = Array.from(mobS, () => new Array(mobS.length - 1).fill(0));

    // This means common can drop unusual
    // Cant be 100% drop rate if rarity is zero
    for (let i = 0; i < ret.length; i++) {
        const cap = Math.max(1, i);
        // Drop rarity
        for (let j = 0; j <= cap; ++j) {
            // Ultra petal undroppable
            if (j >= 6) break;
            let start = dropS[j], end = dropS[j + 1];
            if (j === cap) end = 1;
            const ret1 = Math.pow(n * start + (1 - n), 300000 / mobS[i]);
            const ret2 = Math.pow(n * end + (1 - n), 300000 / mobS[i]);
            ret[i][j] = Math.round((ret2 - ret1) * 100) / 100;
        }
    }

    return ret;
}

/**
 * Calculate hp by level.
 * @deprecated This is the formula after wave.
 */
export function calculateHp(level: number) {
    let hp: number = 100;
    const ff = Math.pow(MOB_DAMAGE_FACTOR[Rarities.MYTHIC], 1 / 200.0);
    return 2.0 * hp * Math.pow(ff, Math.min(level, 150) - 1);
}

/**
 * Calculate wave length.
 * 
 * @param x - Wave progress, number.
 */
export function calculateWaveLength(x: number) {
	return Math.max(60, x ** 0.2 * 18.9287 + 30)
}