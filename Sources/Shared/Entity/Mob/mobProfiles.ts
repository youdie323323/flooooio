// MobData cant cause source leak because its removed in compile

import { MobData } from "../../../Server/Sources/Entity/Mob/Mob";
import { MobType } from "../../EntityType";
import { Rarities } from "../../rarity";

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

        [Rarities.Common]: {
            health: 37.5,
            bodyDamage: 50,
        },
        [Rarities.Unusual]: {
            health: 140.7,
            bodyDamage: 150,
        },
        [Rarities.Rare]: {
            health: 506.25,
            bodyDamage: 450,
        },
        [Rarities.Epic]: {
            health: 2025,
            bodyDamage: 1350,
        },
        [Rarities.Legendary]: {
            health: 15187.5,
            bodyDamage: 4050,
        },
        [Rarities.Mythic]: {
            health: 91125,
            bodyDamage: 12150,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 62.5,
            bodyDamage: 15,
        },
        [Rarities.Unusual]: {
            health: 234.5,
            bodyDamage: 45,
        },
        [Rarities.Rare]: {
            health: 843.75,
            bodyDamage: 135,
        },
        [Rarities.Epic]: {
            health: 3375,
            bodyDamage: 405,
        },
        [Rarities.Legendary]: {
            health: 25312.5,
            bodyDamage: 1215,
        },
        [Rarities.Mythic]: {
            health: 151875,
            bodyDamage: 3645,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 150,
            bodyDamage: 20,
        },
        [Rarities.Unusual]: {
            health: 562.8,
            bodyDamage: 60,
        },
        [Rarities.Rare]: {
            health: 2025,
            bodyDamage: 180,
        },
        [Rarities.Epic]: {
            health: 8100,
            bodyDamage: 540,
        },
        [Rarities.Legendary]: {
            health: 60750,
            bodyDamage: 1620,
        },
        [Rarities.Mythic]: {
            health: 364500,
            bodyDamage: 4860,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 125,
            bodyDamage: 25,

            lightning: 7,
            bounces: 2,
        },
        [Rarities.Unusual]: {
            health: 469,
            bodyDamage: 75,

            lightning: 21,
            bounces: 3,
        },
        [Rarities.Rare]: {
            health: 1687.5,
            bodyDamage: 225,

            lightning: 63,
            bounces: 4,
        },
        [Rarities.Epic]: {
            health: 6750,
            bodyDamage: 675,

            lightning: 189,
            bounces: 5,
        },
        [Rarities.Legendary]: {
            health: 50625,
            bodyDamage: 2025,

            lightning: 567,
            bounces: 6,
        },
        [Rarities.Mythic]: {
            health: 303750,
            bodyDamage: 6075,

            lightning: 1701,
            bounces: 7,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 100,
            bodyDamage: 30,
        },
        [Rarities.Unusual]: {
            health: 375.2,
            bodyDamage: 90,
        },
        [Rarities.Rare]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.Epic]: {
            health: 5400,
            bodyDamage: 810,
        },
        [Rarities.Legendary]: {
            health: 40500,
            bodyDamage: 2430,
        },
        [Rarities.Mythic]: {
            health: 243000,
            bodyDamage: 7290,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 0.5,
            bodyDamage: 5,
        },
        [Rarities.Unusual]: {
            health: 1.876,
            bodyDamage: 15,
        },
        [Rarities.Rare]: {
            health: 6.75,
            bodyDamage: 45,
        },
        [Rarities.Epic]: {
            health: 27,
            bodyDamage: 135,
        },
        [Rarities.Legendary]: {
            health: 202.5,
            bodyDamage: 405,
        },
        [Rarities.Mythic]: {
            health: 1215,
            bodyDamage: 1215,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarities.Unusual]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarities.Rare]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarities.Epic]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.Legendary]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarities.Mythic]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarities.Unusual]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarities.Rare]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarities.Epic]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.Legendary]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarities.Mythic]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarities.Ultra]: {
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

        [Rarities.Common]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarities.Unusual]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarities.Rare]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarities.Epic]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.Legendary]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarities.Mythic]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarities.Ultra]: {
            health: 1825000,
            bodyDamage: 7290,
        },
    },
} satisfies Required<Record<MobType, MobData>>;