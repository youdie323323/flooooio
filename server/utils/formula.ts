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
 * @param x - Wave progress, number.
 */
export function calculateWaveLength(x: number) {
    return Math.max(60, x ** 0.2 * 18.9287 + 30)
}

/**
 * Calculate wave luck by wave progress.
 * 
 * @remarks
 * 
 * m28 message:
 * 
 * ```
 * this isn't fixed at all, but each wave adds 0.3 luck (but it's multiplicative, so luck = 1.3^num waves - 1)
 * say you get 0.7 luck from adding everyone's luck in the party, then the luck from the waves gets multiplied by 1.7
 * it adds everyone's luck then adds 1 and multiplies the current wave "difficulty"
 * you can basically assume that 0.3 luck = +1 wave, 0.69 luck +2 waves, 1.2 luck = +3 waves, etc.
 * ```
 * 
 * Can someone teach me what difficulty means;
 */
export function calculateWaveLuck(waveProgress: number) {
    return 1.3 ** waveProgress - 1;
}