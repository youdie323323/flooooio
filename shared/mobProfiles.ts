import { MobData } from "../server/entity/mob/Mob";
import { Rarities } from "./rarities";
import { MobType } from "./types";

export const MOB_PROFILES: Record<MobType, MobData> = {
    [MobType.BEE]: {
        name: "Bee",
        description: "It stings. Don't touch it.",
        baseSize: 20,
        fraction: 30,
        rx: 30,
        ry: 20,
        [Rarities.COMMON]: {
            health: 37.5,
            bodyDamage: 50,
        },
        [Rarities.UNUSUAL]: {
            health: 140.7,
            bodyDamage: 150,
        },
        [Rarities.RARE]: {
            health: 506.25,
            bodyDamage: 450,
        },
        [Rarities.EPIC]: {
            health: 2025,
            bodyDamage: 1350,
        },
        [Rarities.LEGENDARY]: {
            health: 15187.5,
            bodyDamage: 4050,
        },
        [Rarities.MYTHIC]: {
            health: 91125,
            bodyDamage: 12150,
        },
        [Rarities.ULTRA]: {
            health: 2737500,
            bodyDamage: 36450,
        },
        [Rarities.SUPER]: {
            health: 49200000,
            bodyDamage: 109350,
        },
    },
    [MobType.STARFISH]: {
        name: "Starfish",
        description: "His name is Patrick",
        baseSize: 20,
        fraction: 80,
        rx: 100,
        ry: 100,
        [Rarities.COMMON]: {
            health: 150,
            bodyDamage: 20,
        },
        [Rarities.UNUSUAL]: {
            health: 562.8,
            bodyDamage: 60,
        },
        [Rarities.RARE]: {
            health: 2025,
            bodyDamage: 180,
        },
        [Rarities.EPIC]: {
            health: 8100,
            bodyDamage: 540,
        },
        [Rarities.LEGENDARY]: {
            health: 60750,
            bodyDamage: 1620,
        },
        [Rarities.MYTHIC]: {
            health: 364500,
            bodyDamage: 4860,
        },
        [Rarities.ULTRA]: {
            health: 10950000,
            bodyDamage: 14580,
        },
        [Rarities.SUPER]: {
            health: 196800000,
            bodyDamage: 43740,
        },
    },
    [MobType.JELLYFISH]: {
        name: "Jellyfish",
        description: "Makes the most delicious jam.",
        baseSize: 40,
        fraction: 20,
        rx: 20,
        ry: 20,
        [Rarities.COMMON]: {
            health: 125,
            bodyDamage: 25,

            lightning: 7,
            bounces: 2,
        },
        [Rarities.UNUSUAL]: {
            health: 469,
            bodyDamage: 75,

            lightning: 21,
            bounces: 3,
        },
        [Rarities.RARE]: {
            health: 1687.5,
            bodyDamage: 225,

            lightning: 63,
            bounces: 4,
        },
        [Rarities.EPIC]: {
            health: 6750,
            bodyDamage: 675,

            lightning: 189,
            bounces: 5,
        },
        [Rarities.LEGENDARY]: {
            health: 50625,
            bodyDamage: 2025,

            lightning: 567,
            bounces: 6,
        },
        [Rarities.MYTHIC]: {
            health: 303750,
            bodyDamage: 6075,

            lightning: 1701,
            bounces: 7,
        },
        [Rarities.ULTRA]: {
            health: 9125000,
            bodyDamage: 18225,

            lightning: 5103,
            bounces: 8,
        },
        [Rarities.SUPER]: {
            health: 164000000,
            bodyDamage: 54675,

            lightning: 15309,
            bounces: 9,
        },
    },
};