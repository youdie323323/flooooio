import { Rarity } from "../../EntityRarity";
import { PetalType } from "../../EntityType";
import { PetalData } from "./PetalData";

export const PETAL_PROFILES = {
    [PetalType.Basic]: {
        i18n: {
            name: "Basic",
            fullName: "Basic",
            description: "A nice petal, not too strong but not too weak.",
        },

        collision: {
            fraction: 20,
            rx: 20,
            ry: 20,
        },

        [Rarity.Common]: {
            damage: 10,
            health: 10,
            petalReload: 2.5,
            count: 1,
        },
        [Rarity.Unusual]: {
            damage: 30,
            health: 30,
            petalReload: 2.5,
            count: 1,
        },
        [Rarity.Rare]: {
            damage: 90,
            health: 90,
            petalReload: 2.5,
            count: 1,
        },
        [Rarity.Epic]: {
            damage: 270,
            health: 270,
            petalReload: 2.5,
            count: 1,
        },
        [Rarity.Legendary]: {
            damage: 810,
            health: 810,
            petalReload: 2.5,
            count: 1,
        },
        [Rarity.Mythic]: {
            damage: 2430,
            health: 2430,
            petalReload: 2.5,
            count: 1,
        },
        [Rarity.Ultra]: {
            damage: 7290,
            health: 7290,
            petalReload: 2.5,
            count: 1,
        },
    },

    [PetalType.Faster]: {
        i18n: {
            name: "Faster",
            fullName: "Faster",
            description: "It's so light it makes your other petals spin faster.",
        },

        collision: {
            // Same as basic, light
            fraction: 20,
            rx: 20,
            ry: 20,
        },

        [Rarity.Common]: {
            damage: 8,
            health: 5,
            petalReload: 2.5,
            count: 1,
            rad: 0.5,
        },
        [Rarity.Unusual]: {
            damage: 24,
            health: 15,
            petalReload: 2.5,
            count: 1,
            rad: 0.7,
        },
        [Rarity.Rare]: {
            damage: 72,
            health: 45,
            petalReload: 2.5,
            count: 1,
            rad: 0.9,
        },
        [Rarity.Epic]: {
            damage: 216,
            health: 135,
            petalReload: 2.5,
            count: 1,
            rad: 1.1,
        },
        [Rarity.Legendary]: {
            damage: 648,
            health: 405,
            petalReload: 2.5,
            count: 1,
            rad: 1.3,
        },
        [Rarity.Mythic]: {
            damage: 1944,
            health: 1215,
            petalReload: 2.5,
            count: 2,
            rad: 1.5,
        },
        [Rarity.Ultra]: {
            damage: 5832,
            health: 3645,
            petalReload: 2.5,
            count: 3,
            rad: 1.7,
        },
    },

    [PetalType.BeetleEgg]: {
        i18n: {
            name: "Egg",
            fullName: "Beetle Egg",
            description: "Something interesting might pop out of this.",
        },

        collision: {
            fraction: 20,
            rx: 30,
            ry: 40,
        },

        [Rarity.Common]: {
            damage: 0,
            health: 25,
            petalReload: 1,
            usageReload: 15,
            count: 1,
        },
        [Rarity.Unusual]: {
            damage: 0,
            health: 75,
            petalReload: 1,
            usageReload: 19.2,
            count: 1,
        },
        [Rarity.Rare]: {
            damage: 0,
            health: 225,
            petalReload: 1,
            usageReload: 23.5,
            count: 1,
        },
        [Rarity.Epic]: {
            damage: 0,
            health: 675,
            petalReload: 1,
            usageReload: 32,
            count: 1,
        },
        [Rarity.Legendary]: {
            damage: 0,
            health: 2025,
            petalReload: 1,
            usageReload: 1.8,
            count: 1,
        },
        [Rarity.Mythic]: {
            damage: 0,
            health: 6075,
            petalReload: 1,
            usageReload: 7.4,
            count: 1,
        },
        [Rarity.Ultra]: {
            damage: 0,
            health: 18225,
            petalReload: 1,
            usageReload: 16.9,
            count: 1,
        },
    },

    [PetalType.Bubble]: {
        i18n: {
            name: "Bubble",
            fullName: "Bubble",
            description: "Physics are for the weak.",
        },

        collision: {
            fraction: 15,
            rx: 20,
            ry: 20,
        },

        [Rarity.Common]: {
            damage: 0,
            health: 1,
            petalReload: 5.5,
            usageReload: 0.5,
            count: 1,
        },
        [Rarity.Unusual]: {
            damage: 0,
            health: 1,
            petalReload: 4.5,
            usageReload: 0.5,
            count: 1,
        },
        [Rarity.Rare]: {
            damage: 0,
            health: 1,
            petalReload: 3.5,
            usageReload: 0.5,
            count: 1,
        },
        [Rarity.Epic]: {
            damage: 0,
            health: 1,
            petalReload: 2.5,
            usageReload: 0.5,
            count: 1,
        },
        [Rarity.Legendary]: {
            damage: 0,
            health: 1,
            petalReload: 1.5,
            usageReload: 0.5,
            count: 1,
        },
        [Rarity.Mythic]: {
            damage: 0,
            health: 1,
            petalReload: 0.8,
            usageReload: 0.5,
            count: 1,
        },
        [Rarity.Ultra]: {
            damage: 0,
            health: 1,
            petalReload: 0.5,
            usageReload: 0.1,
            count: 1,
        },
    },

    [PetalType.YinYang]: {
        i18n: {
            name: "Yin Yang",
            fullName: "Yin Yang",
            description: "This mysterious petal affects the rotation of your petals in unpredictable ways.",
        },

        collision: {
            fraction: 20,
            rx: 20,
            ry: 20,
        },

        [Rarity.Common]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
        [Rarity.Unusual]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
        [Rarity.Rare]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
        [Rarity.Epic]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
        [Rarity.Legendary]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
        [Rarity.Mythic]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
        [Rarity.Ultra]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,
        },
    },
} as const satisfies Record<PetalType, PetalData>;