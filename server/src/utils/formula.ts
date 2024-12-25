import { Rarities } from "../../../shared/rarity";
import { memo } from "../../../shared/utils/memoize";
import { MOB_DAMAGE_FACTOR } from "../entity/mob/Mob";

/**
 * Private formula, other formula will go into shared/formula.ts
 */

/**
 * Calculate hp by level.
 * 
 * @deprecated - This is the formula after wave.
 */
export function _calculateHp(level: number) {
    let hp: number = 100;
    const ff = Math.pow(MOB_DAMAGE_FACTOR[Rarities.MYTHIC], 1 / 200.0);
    return 2.0 * hp * Math.pow(ff, Math.min(level, 150) - 1);
}

/**
 * Calculate wave luck.
 * 
 * @param waveProgress - Current progress of wave.
 */
export const calculateWaveLuck = memo((waveProgress: number): number => 1.3 ** waveProgress - 1);

/**
 * Calculate hp by level.
 * 
 * @remarks
 * 
 * 100 * x, x is upgrade.
 */
export const calculateHp = memo((level: number): number => (100 * 1) * 1.02 ** (Math.max(level, 75) - 1));