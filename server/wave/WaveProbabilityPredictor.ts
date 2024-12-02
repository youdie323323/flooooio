import { WaveData } from "./WaveRoom";
import { calculateWaveLength, calculateWaveLuck } from "../utils/formula";
import { Biomes, MobType } from "../../shared/enum";
import { Rarities } from "../../shared/rarity";
import { choice, randomEnum } from "../utils/random";

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

type NestedPartial<T> = {
    [K in keyof T]?: T[K] extends Array<infer R> ? Array<NestedPartial<R>> : NestedPartial<T[K]>
};

export const LINK_MOBS: Set<MobType> = new Set([
    MobType.CENTIPEDE, 
    MobType.CENTIPEDE_DESERT, 
    MobType.CENTIPEDE_EVIL,
]);

// https://official-florrio.fandom.com/wiki/Waves
const MOB_WEIGHTS: NestedPartial<
    Record<
        Biomes,
        Record<
            MobType, 
            [
                // Spawn after this wave
                number,
                // Random weight
                number,
            ]
        >
    >
> = {
    [Biomes.GARDEN]: {
        [MobType.BEE]: [
            1,
            10,
        ],

        [MobType.CENTIPEDE]: [
            2,
            1,
        ],

        [MobType.CENTIPEDE_EVIL]: [
            3,
            1,
        ],
    },
    [Biomes.DESERT]: {
        [MobType.CENTIPEDE_DESERT]: [
            1,
            1,
        ],

        [MobType.BEETLE]: [
            2,
            10,
        ],
    },
    [Biomes.OCEAN]: {
        [MobType.BUBBLE]: [
            1,
            1,
        ],

        [MobType.STARFISH]: [
            3,
            1,
        ],
        [MobType.JELLYFISH]: [
            3,
            1,
        ],
    },
};

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

function getRandomMobType(waveProgress: number, biome: Biomes): MobType {
    const availableMobs = Object.entries(MOB_WEIGHTS[biome])
        .filter(([_, spawnAfter]) => spawnAfter[0] <= waveProgress);
    
    if (availableMobs.length === 0) {
        return randomEnum(MobType);
    }

    const totalWeight = availableMobs.reduce((sum, [_, data]) => sum + data[1], 0);

    let random = Math.random() * totalWeight;
    for (const [mobType, data] of availableMobs) {
        const weight = data[1];
        random -= weight;
        if (random <= 0) {
            return parseInt(mobType) as MobType;
        }
    }

    return parseInt(availableMobs[0][0]) as MobType;
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

    public predictMockData(biome: Biomes, waveProgress: number): [MobType, Rarities] | null {
        this.timer++;

        // See comment of calculateWaveLuck
        const luck = (calculateWaveLuck(waveProgress) * (( /** All players luck */ 0.0) + 1)) * 1;

        if (this.timer % 10 === 0 && this.points > 0) {
            const probabilities = calculateSpawnProbabilities(luck, waveProgress);
            // Ensure atleast common
            if (!Object.keys(probabilities).length) {
                probabilities[Rarities.COMMON] = 1;
            }

            const spawnRarity = weightedChoice(probabilities);
            if (spawnRarity === null) {
                return;
            }

            const mobType = getRandomMobType(waveProgress, biome);

            // Consume point
            this.points--;

            return [mobType, spawnRarity]
        }

        return null;
    }

    public reset(waveProgress: number) {
        this.timer = -1;
        this.points = 50 + Math.pow(waveProgress, 1.6);
        this.points += 1500;
    }
}