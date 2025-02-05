import { Biomes } from "../../../Shared/biome";
import { MobType } from "../../../Shared/EntityType";
import { rarityTable } from "../../../Shared/formula";
import { Rarities } from "../../../Shared/rarity";
import { calculateWaveLuck } from "../Utils/formula";
import { choice, randomEnum } from "../Utils/random";
import { WaveData } from "./WavePool";

/**
 * Set of linkable mobs.
 */
export const LINKABLE_MOBS: Set<MobType> = new Set([
    MobType.Centipede,
    MobType.CentipedeDesert,
    MobType.CentipedeEvil,
]);

interface MobSpawnRule {
    readonly spawnAfter: number;
    readonly weight: number;
}

// https://official-florrio.fandom.com/wiki/Waves
const MOB_SPAWN_RULES = {
    [Biomes.Garden]: {
        [MobType.Bee]: { spawnAfter: 1, weight: 30 },
        [MobType.Spider]: { spawnAfter: 3, weight: 30 },
        [MobType.Centipede]: { spawnAfter: 2, weight: 1 },
        [MobType.CentipedeEvil]: { spawnAfter: 3, weight: 1 },
    },
    [Biomes.Desert]: {
        [MobType.CentipedeDesert]: { spawnAfter: 1, weight: 1 },
        [MobType.Beetle]: { spawnAfter: 2, weight: 30 },
    },
    [Biomes.Ocean]: {
        [MobType.Bubble]: { spawnAfter: 1, weight: 1 },
        [MobType.Starfish]: { spawnAfter: 3, weight: 1 },
        [MobType.Jellyfish]: { spawnAfter: 3, weight: 1 },
    },
} satisfies Readonly<Record<Biomes, Readonly<Record<MobType, MobSpawnRule>>>>;

function getRandomMobType(difficulty: number, biome: Biomes): MobType {
    const availableMobs = Object.entries(MOB_SPAWN_RULES[biome])
        .filter(([_, rule]) => rule.spawnAfter <= difficulty);

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

// From k2r private channel

/*
Wave 21+: Commons stop spawning
Wave 31+: Unusuals stop spawning
Wave 41+: Rares stop spawning
Wave 51+: Epics stop spawning
Wave 61+: Legendaries stop spawning
*/

const WAVE_SPAWN_END_AT = {
    [Rarities.Common]: 20,
    [Rarities.Unusual]: 30,
    [Rarities.Rare]: 40,
    [Rarities.Epic]: 50,
    [Rarities.Legendary]: 60,
    [Rarities.Mythic]: Infinity,
} satisfies Partial<Record<Rarities, number>>;

function secureRandom() {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
}

function getRandomRarity(v: number): Rarities {
    for (let i = rarityTable.length - 1; i >= 0; i--) {
        if (v >= rarityTable[i]) {
            return i as Rarities;
        }
    }

    return Rarities.Common;
}

function getRandomRarityWithRolls(n: number): Rarities {
    let v = secureRandom();
    v = Math.pow(v, 1.0 / n);
    return getRandomRarity(v);
}

function pickRandomRarity(difficulty: number, luck: number): Rarities {
    let r = getRandomRarityWithRolls(Math.pow(1.3, difficulty) * luck);
    if (r >= Rarities.Ultra) r = Rarities.Mythic;
    return r;
}

/**
 * Class for determining spawn mob data.
 */
export default class WaveProbabilityDeterminer {
    private timer: number;

    /**
     * Consumable points.
     */
    private points: number;

    public next({
        progress,
    }: WaveData) {
        this.timer = -1;
        this.points = 50 + Math.pow(progress, 1.6);
        this.points += 1500;
    }

    public predictMockData({
        progress,
        biome,
    }: WaveData): [MobType, Rarities] | null {
        const luck = (calculateWaveLuck(progress) * (( /* All player luck */ 0.0) + 1)) * 1;

        if (this.shouldSpawnMob()) {
            const mobType = getRandomMobType(progress, biome);

            let spawnRarity = pickRandomRarity(progress, 1 + 0);
            for (const [rarity, maxWave] of Object.entries(WAVE_SPAWN_END_AT)) {
                if (progress > maxWave && spawnRarity === parseInt(rarity)) {
                    spawnRarity = Math.min(spawnRarity + 1, Rarities.Mythic) as Rarities;
                }
            }

            // Consume point
            this.points--;

            return [mobType, spawnRarity]
        }

        return null;
    }

    private shouldSpawnMob(): boolean {
        this.timer++;
        return this.timer % 10 === 0 && this.points > 0;
    }
}