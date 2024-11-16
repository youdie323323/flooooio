import { Rarities } from "../../shared/rarities";
import { MobType } from "../../shared/types";
import { onUpdateTick } from "./Entity";
import { mapCenterX, mapCenterY, mapRadius, safetyDistance } from "./EntityChecksum";
import { EntityPool } from "./EntityPool";
import { calculateWaveLuck } from "./utils/formula";
import { choice, getRandomSafePosition } from "./utils/random";

/*
Wave 21+: Commons stop spawning
Wave 31+: Unusuals stop spawning
Wave 41+: Rares stop spawning
Wave 51+: Epics stop spawning
Wave 61+: Legendaries stop spawning
*/

type RarityDict = Partial<Record<Rarities, number>>;

const END_SPAWN_WAVE_RARITY: RarityDict = {
    [Rarities.COMMON]: 20,
    [Rarities.UNUSUAL]: 30,
    [Rarities.RARE]: 40,
    [Rarities.EPIC]: 50,
    [Rarities.LEGENDARY]: 60,
    [Rarities.MYTHIC]: 177,
};

const RARITY_WEIGHTS: RarityDict = {
    [Rarities.COMMON]: 1,
    [Rarities.UNUSUAL]: 0.5,
    [Rarities.RARE]: 0.25,
    [Rarities.EPIC]: 0.1,
    [Rarities.LEGENDARY]: 0.05,
    [Rarities.MYTHIC]: 0.01,
};

function calculateSpawnProbabilities(luck: number, waveProgress: number): RarityDict {
    const probabilities: RarityDict = {};
    let totalWeight = 0;

    for (const key in END_SPAWN_WAVE_RARITY) {
        const parsedKey = parseInt(key) as Rarities;
        if (waveProgress < END_SPAWN_WAVE_RARITY[parsedKey]) {
            const baseWeight = RARITY_WEIGHTS[parsedKey] || 0;
            const weight = baseWeight * Math.max(0, 1 - (waveProgress / 100)) * Math.pow(luck, parsedKey / (Rarities.MYTHIC * 2.5));
            probabilities[parsedKey] = weight;
            totalWeight += weight;
        }
    }

    for (const key in probabilities) {
        const parsedKey = parseInt(key) as Rarities;
        probabilities[parsedKey] /= totalWeight;
    }

    return probabilities;
}

function weightedChoice(probabilities: RarityDict): Rarities | null {
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

export default class EntitySpawnRandomizer {
    public timer: number;

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
    public points: number;

    constructor(private entityPool: EntityPool) {
        this.reset();
    }

    [onUpdateTick](): void {
        const { entityPool } = this;

        // Dont spawn mob when red gage
        if (entityPool.waveProgressIsRedGage) {
            return;
        }

        // See comment of calculateWaveLuck
        const luck = (calculateWaveLuck(entityPool.waveProgress) * (( /** All players luck */ 20) + 1)) * 1;

        if (this.timer % 5 === 5 - 1 && this.points > 0) {
            const probabilities = calculateSpawnProbabilities(luck, entityPool.waveProgress);
            const spawnRarity = weightedChoice(probabilities);
            if (!spawnRarity) {
                return;
            }

            const randPos = getRandomSafePosition(mapCenterX, mapCenterY, mapRadius, safetyDistance, entityPool);
            if (!randPos) {
                return null;
            }

            entityPool.addPetalOrMob(MobType.BEETLE, spawnRarity, randPos[0], randPos[1], null, null);

            // Consume point
            this.points--;
        }

        this.timer++;
    }

    public reset() {
        this.timer = 0;
        this.points = Math.max(50, Math.pow(this.entityPool.waveProgress, 1.5));
    }
}