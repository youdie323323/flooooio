import { Rarities } from "../../../shared/rarities";

// Based on m28 message
export const xpPerLevel = (level: number) => 25 * (Math.floor(level * Math.pow(1.05, level - 1)));

export const GENERATE_DROP_RATE_TABLE = (n: number, rarity: number) => {
    const mobS = [60000, 15000, 2500, 100, 5, 0.1, 0.003, 0.0001];
    const dropS = [0, 0.6932697314296992, 0.9705776240015788, 0.9983084132587667, 0.9999722606141981, 0.9999999914034552, 0.9999999997226992, 1];
    const ret = new Array(7).fill(0);

    // This means common can drop unusual
    // Cant be 100% drop rate if rarity is zero
    const cap = Math.max(1, rarity);
    for (let drop = 0; drop <= cap; ++drop) {
        // Cant drop super petal
        if (drop >= 7) break;
        let start = dropS[drop], end = dropS[drop + 1];
        if (drop === cap) end = 1;
        const ret1 = Math.pow(n * start + (1 - n), 300000 / mobS[rarity]);
        const ret2 = Math.pow(n * end + (1 - n), 300000 / mobS[rarity]);
        ret[drop] = Math.round((ret2 - ret1) * 100) / 100;
    }

    return ret;
}