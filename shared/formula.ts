/**
 * Memoized xp calculation by level.
 */
export const xpPerLevel = (() => {
    const cache = new Map<number, number>();
    
    return (level: number): number => {
        if (cache.has(level)) {
            return cache.get(level);
        }
        
        const result = 25 * (Math.floor(level * Math.pow(1.05, level - 1)));

        cache.set(level, result);

        return result;
    };
})();

/**
 * Memoized level calculation by xp.
 */
export const levelPerXp = (() => {
    const cache = new Map<number, number>();
    
    return (xp: number): number => {
        if (cache.has(xp)) {
            return cache.get(xp);
        }
        
        let level = 1;
        while (xpPerLevel(level) <= xp) level++;
        const result = level - 1;
        
        cache.set(xp, result);
        
        return result;
    };
})();

/**
 * Calculate wave length.
 * 
 * @param x - Wave progress.
 */
export function calculateWaveLength(x: number) {
    return Math.max(60, x ** 0.2 * 18.9287 + 30)
}