import { Biomes } from "../../../shared/biome";
import { MobType } from "../../../shared/EntityType";
import { Rarities } from "../../../shared/rarity";
import { calculateWaveLuck } from "../utils/formula";
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
} satisfies Partial<Record<Rarities, number>>;

const RARITY_WEIGHTS = {
    [Rarities.COMMON]: 1,
    [Rarities.UNUSUAL]: 0.5,
    [Rarities.RARE]: 0.25,
    [Rarities.EPIC]: 0.1,
    [Rarities.LEGENDARY]: 0.025,
    [Rarities.MYTHIC]: 0.01,
} satisfies Partial<Record<Rarities, number>>;

/**
 * Set of linkable mobs.
 */
export const LINKABLE_MOBS: Set<MobType> = new Set([
    MobType.CENTIPEDE,
    MobType.CENTIPEDE_DESERT,
    MobType.CENTIPEDE_EVIL,
]);

// https://official-florrio.fandom.com/wiki/Waves
const MOB_WEIGHTS = {
    [Biomes.GARDEN]: {
        [MobType.BEE]: {
            spawnAfter: 1,
            weight: 30,
        },

        [MobType.SPIDER]: {
            spawnAfter: 3,
            weight: 30,
        },

        [MobType.CENTIPEDE]: {
            spawnAfter: 2,
            weight: 1,
        },

        [MobType.CENTIPEDE_EVIL]: {
            spawnAfter: 3,
            weight: 1,
        },
    },
    [Biomes.DESERT]: {
        [MobType.CENTIPEDE_DESERT]: {
            spawnAfter: 1,
            weight: 1,
        },

        [MobType.BEETLE]: {
            spawnAfter: 2,
            weight: 30,
        },
    },
    [Biomes.OCEAN]: {
        [MobType.BUBBLE]: {
            spawnAfter: 1,
            weight: 1,
        },

        [MobType.STARFISH]: {
            spawnAfter: 3,
            weight: 1,
        },

        [MobType.JELLYFISH]: {
            spawnAfter: 3,
            weight: 1,
        },
    },
} satisfies Record<
    Biomes,
    Record<
        MobType,
        {
            // Spawn after this wave
            spawnAfter: number,
            // Random weight
            weight: number,
        }
    >
>;

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
        .filter(([_, spawnAfter]) => spawnAfter.spawnAfter <= waveProgress);

    if (availableMobs.length === 0) {
        return randomEnum(MobType);
    }

    const totalWeight = availableMobs.reduce((sum, [_, data]) => sum + data.weight, 0);

    let random = Math.random() * totalWeight;
    for (const [mobType, data] of availableMobs) {
        const { weight } = data;
        random -= weight;
        if (random <= 0) {
            return parseInt(mobType) as MobType;
        }
    }

    throw new Error("Unreachable");
}

/**
 * Class for predict then determining spawn mobs.
 */
export default class WaveProbabilityPredictor {
    private timer: number;

    /**
     * Consumable points.
     */
    private points: number;

    public predictMockData(waveProgress: number, biome: Biomes): [MobType, Rarities] | null {
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