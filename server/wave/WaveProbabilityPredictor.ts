import { WaveData } from "./WaveRoom";
import { calculateWaveLuck } from "../utils/formula";
import { MobType } from "../../shared/enum";
import { Rarities } from "../../shared/rarity";

/*
Wave 21+: Commons stop spawning
Wave 31+: Unusuals stop spawning
Wave 41+: Rares stop spawning
Wave 51+: Epics stop spawning
Wave 61+: Legendaries stop spawning
*/

const END_SPAWN_WAVE_RARITY = {
    [Rarities.COMMON]: 20,
    [Rarities.UNUSUAL]: 30,
    [Rarities.RARE]: 40,
    [Rarities.EPIC]: 50,
    [Rarities.LEGENDARY]: 60,
    [Rarities.MYTHIC]: Infinity,
} as const;

const RARITY_WEIGHTS = {
    [Rarities.COMMON]: 1,
    [Rarities.UNUSUAL]: 0.5,
    [Rarities.RARE]: 0.25,
    [Rarities.EPIC]: 0.1,
    [Rarities.LEGENDARY]: 0.025,
    [Rarities.MYTHIC]: 0.01,
} as const;

function calculateSpawnProbabilities(luck: number, waveProgress: number): Partial<Record<Rarities, number>> {
    const probabilities: Partial<Record<Rarities, number>> = {};
    let totalWeight = 0;

    for (const key in END_SPAWN_WAVE_RARITY) {
        const parsedKey = parseInt(key) as Rarities;
        if (waveProgress < END_SPAWN_WAVE_RARITY[parsedKey]) {
            const baseWeight = RARITY_WEIGHTS[parsedKey] || 0;

            // TODO: luck multiplication makes no sense with normalization

            // Ill explain what 180 coming from,
            // in the original wave, if wave above 177, only common mobs are spawning,
            // that because m28 were divide wave by 178, so that constant
            const weight = baseWeight * Math.max(0, 1 - (waveProgress / 178)) * luck;
            probabilities[parsedKey] = weight;
            totalWeight += weight;
        }
    }

    for (const key in probabilities) {
        const parsedKey = parseInt(key) as Rarities;
        probabilities[parsedKey] /= totalWeight;
        if (isNaN(probabilities[parsedKey])) {
            delete probabilities[parsedKey];
        }
    }

    return probabilities;
}

function weightedChoice(probabilities: Partial<Record<Rarities, number>>): Rarities | null {
    const randomValue = Math.random();
    let cumulative = 0;

    for (const key in probabilities) {
        const parsedKey = parseInt(key) as Rarities;
        cumulative += probabilities[parsedKey];
        if (randomValue < cumulative) {
            return parsedKey;
        }
    }

    return null;
}

export default class WaveProbabilityPredictor {
    private timer: number;

    /**
     * Consumable points.
     * 
     * @remarks
     * 
     * From m28 message:
     * ```
     * basically a wave has a number of points. Each mob has a cost (same regardless of rarity). 
     * It selects random mobs from the available pool (with some weights) until the wave runs out of points.
     * ```
     */
    private points: number;

    public predictMockData(waveData: WaveData): [MobType, Rarities] | null {
        this.timer++;

        // See comment of calculateWaveLuck
        const luck = (calculateWaveLuck(waveData.waveProgress) * (( /** All players luck */ 0.0) + 1)) * 1;

        if (this.timer % 10 === 0 && this.points > 0) {
            const probabilities = calculateSpawnProbabilities(luck, waveData.waveProgress);
            // Ensure atleast common
            if (!Object.keys(probabilities).length) {
                probabilities[Rarities.COMMON] = 1;
            }
            const spawnRarity = weightedChoice(probabilities);
            if (spawnRarity === null) {
                return;
            }

            // Consume point
            this.points--;

            return [MobType.BEETLE, spawnRarity]
        }

        return null;
    }

    public reset(waveData: WaveData) {
        this.timer = -1;
        this.points = 50 + Math.pow(waveData.waveProgress, 1.6);
        this.points += 1500;
    }
}