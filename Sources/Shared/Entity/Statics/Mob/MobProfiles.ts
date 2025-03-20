import { Rarity } from "../EntityRarity";
import { MobType } from "../EntityType";
import type { MobData } from "./MobData";

export const MOB_PROFILES = {
    [MobType.BEE]: {
        baseSize: 30,

        i18n: {
            name: "Bee",
            description: "It stings. Don't touch it.",
        },

        collision: {
            fraction: 30,
            rx: 30,
            ry: 20,
        },

        [Rarity.COMMON]: {
            health: 37.5,
            bodyDamage: 50,
        },
        [Rarity.UNUSUAL]: {
            health: 140.7,
            bodyDamage: 150,
        },
        [Rarity.RARE]: {
            health: 506.25,
            bodyDamage: 450,
        },
        [Rarity.EPIC]: {
            health: 2025,
            bodyDamage: 1350,
        },
        [Rarity.LEGENDARY]: {
            health: 15187.5,
            bodyDamage: 4050,
        },
        [Rarity.MYTHIC]: {
            health: 91125,
            bodyDamage: 12150,
        },
        [Rarity.ULTRA]: {
            health: 2737500,
            bodyDamage: 36450,
        },
    },

    [MobType.SPIDER]: {
        baseSize: 20,

        i18n: {
            name: "Spider",
            description: "Spooky.",
        },

        collision: {
            fraction: 40,
            rx: 40,
            ry: 40,
        },

        [Rarity.COMMON]: {
            health: 62.5,
            bodyDamage: 15,
        },
        [Rarity.UNUSUAL]: {
            health: 234.5,
            bodyDamage: 45,
        },
        [Rarity.RARE]: {
            health: 843.75,
            bodyDamage: 135,
        },
        [Rarity.EPIC]: {
            health: 3375,
            bodyDamage: 405,
        },
        [Rarity.LEGENDARY]: {
            health: 25312.5,
            bodyDamage: 1215,
        },
        [Rarity.MYTHIC]: {
            health: 151875,
            bodyDamage: 3645,
        },
        [Rarity.ULTRA]: {
            health: 4562500,
            bodyDamage: 10935,
        },
    },

    [MobType.STARFISH]: {
        baseSize: 20,

        i18n: {
            name: "Starfish",
            description: "His name is Patrick",
        },

        collision: {
            fraction: 80,
            rx: 100,
            ry: 100,
        },

        [Rarity.COMMON]: {
            health: 150,
            bodyDamage: 20,
        },
        [Rarity.UNUSUAL]: {
            health: 562.8,
            bodyDamage: 60,
        },
        [Rarity.RARE]: {
            health: 2025,
            bodyDamage: 180,
        },
        [Rarity.EPIC]: {
            health: 8100,
            bodyDamage: 540,
        },
        [Rarity.LEGENDARY]: {
            health: 60750,
            bodyDamage: 1620,
        },
        [Rarity.MYTHIC]: {
            health: 364500,
            bodyDamage: 4860,
        },
        [Rarity.ULTRA]: {
            health: 10950000,
            bodyDamage: 14580,
        },
    },

    [MobType.JELLYFISH]: {
        baseSize: 40,

        i18n: {
            name: "Jellyfish",
            description: "Makes the most delicious jam.",
        },

        collision: {
            fraction: 20,
            rx: 20,
            ry: 20,
        },

        [Rarity.COMMON]: {
            health: 125,
            bodyDamage: 25,

            lightning: 7,
            bounces: 2,
        },
        [Rarity.UNUSUAL]: {
            health: 469,
            bodyDamage: 75,

            lightning: 21,
            bounces: 3,
        },
        [Rarity.RARE]: {
            health: 1687.5,
            bodyDamage: 225,

            lightning: 63,
            bounces: 4,
        },
        [Rarity.EPIC]: {
            health: 6750,
            bodyDamage: 675,

            lightning: 189,
            bounces: 5,
        },
        [Rarity.LEGENDARY]: {
            health: 50625,
            bodyDamage: 2025,

            lightning: 567,
            bounces: 6,
        },
        [Rarity.MYTHIC]: {
            health: 303750,
            bodyDamage: 6075,

            lightning: 1701,
            bounces: 7,
        },
        [Rarity.ULTRA]: {
            health: 9125000,
            bodyDamage: 18225,

            lightning: 5103,
            bounces: 8,
        },
    },

    [MobType.BEETLE]: {
        baseSize: 30,

        i18n: {
            name: "Beetle",
            description: "It's hungry and flowers are its favorite meal.",
        },

        collision: {
            fraction: 40,
            rx: 40,
            ry: 34,
        },

        [Rarity.COMMON]: {
            health: 100,
            bodyDamage: 30,
        },
        [Rarity.UNUSUAL]: {
            health: 375.2,
            bodyDamage: 90,
        },
        [Rarity.RARE]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.EPIC]: {
            health: 5400,
            bodyDamage: 810,
        },
        [Rarity.LEGENDARY]: {
            health: 40500,
            bodyDamage: 2430,
        },
        [Rarity.MYTHIC]: {
            health: 243000,
            bodyDamage: 7290,
        },
        [Rarity.ULTRA]: {
            health: 7300000,
            bodyDamage: 21870,
        },
    },

    [MobType.BUBBLE]: {
        baseSize: 40,

        i18n: {
            name: "Bubble",
            description: "Pop",
        },

        collision: {
            fraction: 15,
            rx: 20,
            ry: 20,
        },

        [Rarity.COMMON]: {
            health: 0.5,
            bodyDamage: 5,
        },
        [Rarity.UNUSUAL]: {
            health: 1.876,
            bodyDamage: 15,
        },
        [Rarity.RARE]: {
            health: 6.75,
            bodyDamage: 45,
        },
        [Rarity.EPIC]: {
            health: 27,
            bodyDamage: 135,
        },
        [Rarity.LEGENDARY]: {
            health: 202.5,
            bodyDamage: 405,
        },
        [Rarity.MYTHIC]: {
            health: 1215,
            bodyDamage: 1215,
        },
        [Rarity.ULTRA]: {
            health: 36500,
            bodyDamage: 3645,
        },
    },

    [MobType.CENTIPEDE]: {
        baseSize: 40,

        i18n: {
            name: "Centipede",
            description: "It's just there doing its thing.",
        },

        collision: {
            fraction: 40,
            rx: 40,
            ry: 40,
        },

        [Rarity.COMMON]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarity.UNUSUAL]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarity.RARE]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarity.EPIC]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.LEGENDARY]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarity.MYTHIC]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarity.ULTRA]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },

    [MobType.CENTIPEDE_EVIL]: {
        baseSize: 40,

        i18n: {
            name: "Centipede",
            description: "This one loves flowers.",
        },

        collision: {
            fraction: 40,
            rx: 40,
            ry: 40,
        },

        [Rarity.COMMON]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarity.UNUSUAL]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarity.RARE]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarity.EPIC]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.LEGENDARY]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarity.MYTHIC]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarity.ULTRA]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },
    
    [MobType.CENTIPEDE_DESERT]: {
        baseSize: 40,

        i18n: {
            name: "Centipede",
            description: "Gotta go fast.",
        },

        collision: {
            fraction: 40,
            rx: 40,
            ry: 40,
        },

        [Rarity.COMMON]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarity.UNUSUAL]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarity.RARE]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarity.EPIC]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.LEGENDARY]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarity.MYTHIC]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarity.ULTRA]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },
} as const satisfies Record<MobType, MobData>;