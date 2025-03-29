import type { WaveData } from "./WavePool";
import { Biome } from "../../../../../Shared/Biome";
import { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import { MobType, MOB_TYPES } from "../../../../../Shared/Entity/Statics/EntityType";
import { rarityTable } from "../../../../../Shared/Formula";

/**
 * Set of linkable mobs.
 */
export const LINKABLE_MOBS: Set<MobType> = new Set([
    MobType.CENTIPEDE,
    MobType.CENTIPEDE_DESERT,
    MobType.CENTIPEDE_EVIL,
]);

type MobSpawnRule = Readonly<{
    spawnAfter: number;
    weight: number;
}>;

// https://official-florrio.fandom.com/wiki/Waves
const MOB_SPAWN_RULES = {
    [Biome.GARDEN]: {
        [MobType.BEE]: { spawnAfter: 1, weight: 30 },
        [MobType.SPIDER]: { spawnAfter: 3, weight: 30 },
        [MobType.CENTIPEDE]: { spawnAfter: 2, weight: 1 },
        [MobType.CENTIPEDE_EVIL]: { spawnAfter: 3, weight: 1 },
    },
    [Biome.DESERT]: {
        [MobType.CENTIPEDE_DESERT]: { spawnAfter: 1, weight: 1 },
        [MobType.BEETLE]: { spawnAfter: 2, weight: 30 },
    },
    [Biome.OCEAN]: {
        [MobType.BUBBLE]: { spawnAfter: 1, weight: 1 },
        [MobType.SPONGE]: { spawnAfter: 1, weight: 1 },
        [MobType.STARFISH]: { spawnAfter: 3, weight: 1 },
        [MobType.JELLYFISH]: { spawnAfter: 3, weight: 1 },
    },
} as const satisfies Record<Biome, Partial<Record<MobType, MobSpawnRule>>>;

function getRandomMobType(difficulty: number, biome: Biome): MobType {
    const availableMobs = Object.entries(MOB_SPAWN_RULES[biome])
        .filter(([_, rule]) => rule.spawnAfter <= difficulty);

    if (availableMobs.length === 0) {
        return MOB_TYPES[Math.floor(Math.random() * MOB_TYPES.length)];
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

    return MobType.BEE;
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
    [Rarity.COMMON]: 20,
    [Rarity.UNUSUAL]: 30,
    [Rarity.RARE]: 40,
    [Rarity.EPIC]: 50,
    [Rarity.LEGENDARY]: 60,
    [Rarity.MYTHIC]: Infinity,
} satisfies Partial<Record<Rarity, number>>;

const u32Source = new Uint32Array(1);

function secureRandom() {
    return crypto.getRandomValues(u32Source)[0] / 4294967295;
}

function getRandomRarity(v: number): Rarity {
    for (let i = rarityTable.length - 1; i >= 0; i--) {
        if (v >= rarityTable[i]) {
            return i satisfies Rarity;
        }
    }

    return Rarity.COMMON;
}

function getRandomRarityWithRolls(n: number): Rarity {
    let v = secureRandom();
    v = Math.pow(v, 1.0 / n);

    return getRandomRarity(v);
}

function pickRandomRarity(difficulty: number, luck: number): Rarity {
    let r = getRandomRarityWithRolls(Math.pow(1.3, difficulty) * luck);
    if (r >= Rarity.ULTRA) r = Rarity.MYTHIC;

    return r;
}

type StaticMobData = [MobType, Rarity];

/**
 * Class for determining static spawn mob data.
 */
export default class SpawnMobDeterminer {
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

    private calculateWaveLuck(progress: number): number {
        return 1.3 ** progress - 1;
    }

    public determineStaticMobData({
        biome,
        progress,
    }: WaveData): StaticMobData | null {
        const luck = (this.calculateWaveLuck(progress) * (( /* All players luck */ 0.0) + 1)) * 1;

        if (this.shouldSpawnMob()) {
            const mobType = getRandomMobType(progress, biome);

            let spawnRarity = pickRandomRarity(progress, 1 + 0);
            for (const [rarity, maxWave] of Object.entries(WAVE_SPAWN_END_AT)) {
                if (progress > maxWave && spawnRarity === parseInt(rarity)) {
                    spawnRarity = Math.min(spawnRarity + 1, Rarity.MYTHIC) satisfies Rarity;
                }
            }

            // Consume point
            this.points--;

            return [mobType, spawnRarity] satisfies StaticMobData;
        }

        return null;
    }

    private shouldSpawnMob(): boolean {
        this.timer++;

        return this.timer % 10 === 0 && this.points > 0;
    }
}