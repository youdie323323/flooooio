/*
  Private formula, other formula will go into shared/formula.ts
*/

/**
 * Calculate wave luck.
 * 
 * @param waveProgress - Current progress of wave
 */
export const calculateWaveLuck = (waveProgress: number): number => 1.3 ** waveProgress - 1;

/**
 * Calculate hp by level.
 * 
 * @remarks
 * 100 * x, x is upgrade.
 */
export const calculateHp = (level: number): number => (100 * 10000) * 1.02 ** (Math.max(level, 75) - 1);