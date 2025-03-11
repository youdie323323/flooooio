
import { calculateWaveLuck } from "../WaveFormula";
import { WaveData } from "../../WavePool";
import { Biome } from "../../../../../../../Shared/Biome";
import { Rarity } from "../../../../../../../Shared/Entity/Statics/EntityRarity";
import { MobType, MOB_TYPES } from "../../../../../../../Shared/Entity/Statics/EntityType";
import { rarityTable } from "../../../../../../../Shared/Formula";
import { choice } from "../../../../Utils/random";

/**
 * Set of linkable mobs.
 */
export const LINKABLE_MOBS: Set<MobType> = new Set([
    MobType.Centipede,
    MobType.CentipedeDesert,
    MobType.CentipedeEvil,
]);

type MobSpawnRule = Readonly<{
    spawnAfter: number;
    weight: number;
}>;

// https://official-florrio.fandom.com/wiki/Waves
const MOB_SPAWN_RULES = {
    [Biome.Garden]: {
        [MobType.Bee]: { spawnAfter: 1, weight: 30 },
        [MobType.Spider]: { spawnAfter: 3, weight: 30 },
        [MobType.Centipede]: { spawnAfter: 2, weight: 1 },
        [MobType.CentipedeEvil]: { spawnAfter: 3, weight: 1 },
    },
    [Biome.Desert]: {
        [MobType.CentipedeDesert]: { spawnAfter: 1, weight: 1 },
        [MobType.Beetle]: { spawnAfter: 2, weight: 30 },
    },
    [Biome.Ocean]: {
        [MobType.Bubble]: { spawnAfter: 1, weight: 1 },
        [MobType.Starfish]: { spawnAfter: 3, weight: 1 },
        [MobType.Jellyfish]: { spawnAfter: 3, weight: 1 },
    },
} as const satisfies Record<Biome, Partial<Record<MobType, MobSpawnRule>>>;

function getRandomMobType(difficulty: number, biome: Biome): MobType {
    const availableMobs = Object.entries(MOB_SPAWN_RULES[biome])
        .filter(([_, rule]) => rule.spawnAfter <= difficulty);

    if (availableMobs.length === 0) {
        return choice(MOB_TYPES);
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
    [Rarity.Common]: 20,
    [Rarity.Unusual]: 30,
    [Rarity.Rare]: 40,
    [Rarity.Epic]: 50,
    [Rarity.Legendary]: 60,
    [Rarity.Mythic]: Infinity,
} satisfies Partial<Record<Rarity, number>>;

const u32Source = new Uint32Array(1);

function secureRandom() {
    return crypto.getRandomValues(u32Source)[0] / 4294967295;
}

function getRandomRarity(v: number): Rarity {
    for (let i = rarityTable.length - 1; i >= 0; i--) {
        if (v >= rarityTable[i]) {
            return i as Rarity;
        }
    }

    return Rarity.Common;
}

function getRandomRarityWithRolls(n: number): Rarity {
    let v = secureRandom();
    v = Math.pow(v, 1.0 / n);

    return getRandomRarity(v);
}

function pickRandomRarity(difficulty: number, luck: number): Rarity {
    let r = getRandomRarityWithRolls(Math.pow(1.3, difficulty) * luck);
    if (r >= Rarity.Ultra) r = Rarity.Mythic;

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

    public predictStaticMobData({
        progress,
        biome,
    }: WaveData): StaticMobData | null {
        const luck = (calculateWaveLuck(progress) * (( /* All players luck */ 0.0) + 1)) * 1;

        if (this.shouldSpawnMob()) {
            const mobType = getRandomMobType(progress, biome);

            let spawnRarity = pickRandomRarity(progress, 1 + 0);
            for (const [rarity, maxWave] of Object.entries(WAVE_SPAWN_END_AT)) {
                if (progress > maxWave && spawnRarity === parseInt(rarity)) {
                    spawnRarity = Math.min(spawnRarity + 1, Rarity.Mythic) as Rarity;
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