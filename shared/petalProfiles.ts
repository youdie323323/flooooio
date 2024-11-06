import { PetalData } from "../server/entity/mob/petal/Petal";
import { Rarities } from "./rarities";
import { PetalType } from "./types";

export const PETAL_PROFILES: Record<PetalType, PetalData> = {
    [PetalType.BASIC]: {
        name: "Basic",
        description: "A nice petal, not too strong but not too weak.",
        fraction: 20,
        rx: 20,
        ry: 20,
        [Rarities.COMMON]: {
            damage: 10,
            health: 10,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.UNUSUAL]: {
            damage: 30,
            health: 30,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.RARE]: {
            damage: 90,
            health: 90,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.EPIC]: {
            damage: 270,
            health: 270,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.LEGENDARY]: {
            damage: 810,
            health: 810,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.MYTHIC]: {
            damage: 2430,
            health: 2430,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.ULTRA]: {
            damage: 7290,
            health: 7290,
            petalReload: 2.5,
            count: 1,
        },
        [Rarities.SUPER]: {
            damage: 21870,
            health: 21870,
            petalReload: 2.5,
            count: 1,
        },
    },
    [PetalType.FASTER]: {
        name: "Faster",
        description: "It's so light it makes your other petals spin faster.",
        // Same as basic, light
        fraction: 20,
        rx: 20,
        ry: 20,
        [Rarities.COMMON]: {
            damage: 8,
            health: 5,
            petalReload: 2.5,
            count: 1,
            rad: 0.5,
        },
        [Rarities.UNUSUAL]: {
            damage: 24,
            health: 15,
            petalReload: 2.5,
            count: 1,
            rad: 0.7,
        },
        [Rarities.RARE]: {
            damage: 72,
            health: 45,
            petalReload: 2.5,
            count: 1,
            rad: 0.9,
        },
        [Rarities.EPIC]: {
            damage: 216,
            health: 135,
            petalReload: 2.5,
            count: 1,
            rad: 1.1,
        },
        [Rarities.LEGENDARY]: {
            damage: 648,
            health: 405,
            petalReload: 2.5,
            count: 1,
            rad: 1.3,
        },
        [Rarities.MYTHIC]: {
            damage: 1944,
            health: 1215,
            petalReload: 2.5,
            count: 1,
            rad: 1.5,
        },
        [Rarities.ULTRA]: {
            damage: 5832,
            health: 3645,
            petalReload: 2.5,
            count: 1,
            rad: 1.7,
        },
        [Rarities.SUPER]: {
            damage: 17496,
            health: 10935,
            petalReload: 2.5,
            count: 1,
            rad: 1.9,
        },
    },
};