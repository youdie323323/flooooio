import { Rarity } from "../EntityRarity";
import { MobType } from "../EntityType";
import { MobData } from "./MobData";

export const MOB_PROFILES = {
    [MobType.Bee]: {
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

        [Rarity.Common]: {
            health: 37.5,
            bodyDamage: 50,
        },
        [Rarity.Unusual]: {
            health: 140.7,
            bodyDamage: 150,
        },
        [Rarity.Rare]: {
            health: 506.25,
            bodyDamage: 450,
        },
        [Rarity.Epic]: {
            health: 2025,
            bodyDamage: 1350,
        },
        [Rarity.Legendary]: {
            health: 15187.5,
            bodyDamage: 4050,
        },
        [Rarity.Mythic]: {
            health: 91125,
            bodyDamage: 12150,
        },
        [Rarity.Ultra]: {
            health: 2737500,
            bodyDamage: 36450,
        },
    },

    [MobType.Spider]: {
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

        [Rarity.Common]: {
            health: 62.5,
            bodyDamage: 15,
        },
        [Rarity.Unusual]: {
            health: 234.5,
            bodyDamage: 45,
        },
        [Rarity.Rare]: {
            health: 843.75,
            bodyDamage: 135,
        },
        [Rarity.Epic]: {
            health: 3375,
            bodyDamage: 405,
        },
        [Rarity.Legendary]: {
            health: 25312.5,
            bodyDamage: 1215,
        },
        [Rarity.Mythic]: {
            health: 151875,
            bodyDamage: 3645,
        },
        [Rarity.Ultra]: {
            health: 4562500,
            bodyDamage: 10935,
        },
    },

    [MobType.Starfish]: {
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

        [Rarity.Common]: {
            health: 150,
            bodyDamage: 20,
        },
        [Rarity.Unusual]: {
            health: 562.8,
            bodyDamage: 60,
        },
        [Rarity.Rare]: {
            health: 2025,
            bodyDamage: 180,
        },
        [Rarity.Epic]: {
            health: 8100,
            bodyDamage: 540,
        },
        [Rarity.Legendary]: {
            health: 60750,
            bodyDamage: 1620,
        },
        [Rarity.Mythic]: {
            health: 364500,
            bodyDamage: 4860,
        },
        [Rarity.Ultra]: {
            health: 10950000,
            bodyDamage: 14580,
        },
    },

    [MobType.Jellyfish]: {
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

        [Rarity.Common]: {
            health: 125,
            bodyDamage: 25,

            lightning: 7,
            bounces: 2,
        },
        [Rarity.Unusual]: {
            health: 469,
            bodyDamage: 75,

            lightning: 21,
            bounces: 3,
        },
        [Rarity.Rare]: {
            health: 1687.5,
            bodyDamage: 225,

            lightning: 63,
            bounces: 4,
        },
        [Rarity.Epic]: {
            health: 6750,
            bodyDamage: 675,

            lightning: 189,
            bounces: 5,
        },
        [Rarity.Legendary]: {
            health: 50625,
            bodyDamage: 2025,

            lightning: 567,
            bounces: 6,
        },
        [Rarity.Mythic]: {
            health: 303750,
            bodyDamage: 6075,

            lightning: 1701,
            bounces: 7,
        },
        [Rarity.Ultra]: {
            health: 9125000,
            bodyDamage: 18225,

            lightning: 5103,
            bounces: 8,
        },
    },

    [MobType.Beetle]: {
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

        [Rarity.Common]: {
            health: 100,
            bodyDamage: 30,
        },
        [Rarity.Unusual]: {
            health: 375.2,
            bodyDamage: 90,
        },
        [Rarity.Rare]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.Epic]: {
            health: 5400,
            bodyDamage: 810,
        },
        [Rarity.Legendary]: {
            health: 40500,
            bodyDamage: 2430,
        },
        [Rarity.Mythic]: {
            health: 243000,
            bodyDamage: 7290,
        },
        [Rarity.Ultra]: {
            health: 7300000,
            bodyDamage: 21870,
        },
    },

    [MobType.Bubble]: {
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

        [Rarity.Common]: {
            health: 0.5,
            bodyDamage: 5,
        },
        [Rarity.Unusual]: {
            health: 1.876,
            bodyDamage: 15,
        },
        [Rarity.Rare]: {
            health: 6.75,
            bodyDamage: 45,
        },
        [Rarity.Epic]: {
            health: 27,
            bodyDamage: 135,
        },
        [Rarity.Legendary]: {
            health: 202.5,
            bodyDamage: 405,
        },
        [Rarity.Mythic]: {
            health: 1215,
            bodyDamage: 1215,
        },
        [Rarity.Ultra]: {
            health: 36500,
            bodyDamage: 3645,
        },
    },

    [MobType.Centipede]: {
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

        [Rarity.Common]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarity.Unusual]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarity.Rare]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarity.Epic]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.Legendary]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarity.Mythic]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarity.Ultra]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },

    [MobType.CentipedeEvil]: {
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

        [Rarity.Common]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarity.Unusual]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarity.Rare]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarity.Epic]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.Legendary]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarity.Mythic]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarity.Ultra]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },
    
    [MobType.CentipedeDesert]: {
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

        [Rarity.Common]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarity.Unusual]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarity.Rare]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarity.Epic]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarity.Legendary]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarity.Mythic]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarity.Ultra]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },
} as const satisfies Record<MobType, MobData>;