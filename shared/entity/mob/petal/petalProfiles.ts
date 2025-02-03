import { PetalData } from "../../../../server/src/entity/mob/petal/Petal";
import { PetalType } from "../../../EntityType";
import { Rarities } from "../../../rarity";

export const PETAL_PROFILES = {
    [PetalType.BASIC]: {
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

        [Rarities.COMMON]: {
            damage: 10,
            health: 10,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.UNUSUAL]: {
            damage: 30,
            health: 30,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.RARE]: {
            damage: 90,
            health: 90,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.EPIC]: {
            damage: 270,
            health: 270,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.LEGENDARY]: {
            damage: 810,
            health: 810,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.MYTHIC]: {
            damage: 2430,
            health: 2430,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.ULTRA]: {
            damage: 7290,
            health: 7290,
            petalReload: 2.5,
            count: 1,

            isCluster: false,
        },
    },

    [PetalType.FASTER]: {
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

        [Rarities.COMMON]: {
            damage: 8,
            health: 5,
            petalReload: 2.5,
            count: 1,
            rad: 0.5,

            isCluster: false,
        },
        [Rarities.UNUSUAL]: {
            damage: 24,
            health: 15,
            petalReload: 2.5,
            count: 1,
            rad: 0.7,

            isCluster: false,
        },
        [Rarities.RARE]: {
            damage: 72,
            health: 45,
            petalReload: 2.5,
            count: 1,
            rad: 0.9,

            isCluster: false,
        },
        [Rarities.EPIC]: {
            damage: 216,
            health: 135,
            petalReload: 2.5,
            count: 1,
            rad: 1.1,

            isCluster: false,
        },
        [Rarities.LEGENDARY]: {
            damage: 648,
            health: 405,
            petalReload: 2.5,
            count: 1,
            rad: 1.3,

            isCluster: false,
        },
        [Rarities.MYTHIC]: {
            damage: 1944,
            health: 1215,
            petalReload: 2.5,
            count: 2,
            rad: 1.5,

            isCluster: true,
        },
        [Rarities.ULTRA]: {
            damage: 5832,
            health: 3645,
            petalReload: 2.5,
            count: 3,
            rad: 1.7,

            isCluster: true,
        },
    },

    [PetalType.BEETLE_EGG]: {
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

        [Rarities.COMMON]: {
            damage: 0,
            health: 25,
            petalReload: 1,
            usageReload: 15,
            count: 1,

            isCluster: false,
        },
        [Rarities.UNUSUAL]: {
            damage: 0,
            health: 75,
            petalReload: 1,
            usageReload: 19.2,
            count: 1,

            isCluster: false,
        },
        [Rarities.RARE]: {
            damage: 0,
            health: 225,
            petalReload: 1,
            usageReload: 23.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.EPIC]: {
            damage: 0,
            health: 675,
            petalReload: 1,
            usageReload: 32,
            count: 1,

            isCluster: false,
        },
        [Rarities.LEGENDARY]: {
            damage: 0,
            health: 2025,
            petalReload: 1,
            usageReload: 1.8,
            count: 1,

            isCluster: false,
        },
        [Rarities.MYTHIC]: {
            damage: 0,
            health: 6075,
            petalReload: 1,
            usageReload: 7.4,
            count: 1,

            isCluster: false,
        },
        [Rarities.ULTRA]: {
            damage: 0,
            health: 18225,
            petalReload: 1,
            usageReload: 16.9,
            count: 1,

            isCluster: false,
        },
    },

    [PetalType.BUBBLE]: {
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

        [Rarities.COMMON]: {
            damage: 0,
            health: 1,
            petalReload: 5.5,
            usageReload: 0.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.UNUSUAL]: {
            damage: 0,
            health: 1,
            petalReload: 4.5,
            usageReload: 0.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.RARE]: {
            damage: 0,
            health: 1,
            petalReload: 3.5,
            usageReload: 0.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.EPIC]: {
            damage: 0,
            health: 1,
            petalReload: 2.5,
            usageReload: 0.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.LEGENDARY]: {
            damage: 0,
            health: 1,
            petalReload: 1.5,
            usageReload: 0.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.MYTHIC]: {
            damage: 0,
            health: 1,
            petalReload: 0.8,
            usageReload: 0.5,
            count: 1,

            isCluster: false,
        },
        [Rarities.ULTRA]: {
            damage: 0,
            health: 1,
            petalReload: 0.5,
            usageReload: 0.1,
            count: 1,

            isCluster: false,
        },
    },

    [PetalType.YIN_YANG]: {
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

        [Rarities.COMMON]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
        [Rarities.UNUSUAL]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
        [Rarities.RARE]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
        [Rarities.EPIC]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
        [Rarities.LEGENDARY]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
        [Rarities.MYTHIC]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
        [Rarities.ULTRA]: {
            damage: 90,
            health: 90,
            petalReload: 2,
            count: 1,

            isCluster: false,
        },
    },
} satisfies Required<Record<PetalType, PetalData>>;