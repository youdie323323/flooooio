import { Rarities } from "../../shared/rarity";
import { MOB_DAMAGE_FACTOR } from "../entity/mob/Mob";

/**
 * Calculate required xp by level.
 */
export const xpPerLevel = (level: number) => 25 * (Math.floor(level * Math.pow(1.05, level - 1)));

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
 * @param x - Wave progress.
 */
export function calculateWaveLength(x: number) {
    return Math.max(60, x ** 0.2 * 18.9287 + 30)
}

/**
 * Calculate wave luck.
 * 
 * @param waveProgress - Current progress of wave.
 */
export function calculateWaveLuck(waveProgress: number) {
    return 1.3 ** waveProgress - 1;
}