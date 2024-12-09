// MobData cant cause source leak because its removed in compile

import { MobData } from "../../../server/src/entity/mob/Mob";
import { MobType } from "../../enum";
import { Rarities } from "../../rarity";

export const MOB_PROFILES: Partial<Record<MobType, MobData>> = {
    [MobType.BEE]: {
        name: "Bee",
        description: "It stings. Don't touch it.",
        baseSize: 30,
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
    [MobType.BEETLE]: {
        name: "Beetle",
        description: "It's hungry and flowers are its favorite meal.",
        baseSize: 30,
        fraction: 40,
        rx: 40,
        ry: 34,
        [Rarities.COMMON]: {
            health: 100,
            bodyDamage: 30,
        },
        [Rarities.UNUSUAL]: {
            health: 375.2,
            bodyDamage: 90,
        },
        [Rarities.RARE]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.EPIC]: {
            health: 5400,
            bodyDamage: 810,
        },
        [Rarities.LEGENDARY]: {
            health: 40500,
            bodyDamage: 2430,
        },
        [Rarities.MYTHIC]: {
            health: 243000,
            bodyDamage: 7290,
        },
        [Rarities.ULTRA]: {
            health: 7300000,
            bodyDamage: 21870,
        },
        [Rarities.SUPER]: {
            health: 131200000,
            bodyDamage: 65610,
        },
    },
    [MobType.BUBBLE]: {
        name: "Bubble",
        description: "Pop",
        baseSize: 40,
        fraction: 15,
        rx: 20,
        ry: 20,
        [Rarities.COMMON]: {
            health: 0.5,
            bodyDamage: 5,
        },
        [Rarities.UNUSUAL]: {
            health: 1.876,
            bodyDamage: 15,
        },
        [Rarities.RARE]: {
            health: 6.75,
            bodyDamage: 45,
        },
        [Rarities.EPIC]: {
            health: 27,
            bodyDamage: 135,
        },
        [Rarities.LEGENDARY]: {
            health: 202.5,
            bodyDamage: 405,
        },
        [Rarities.MYTHIC]: {
            health: 1215,
            bodyDamage: 1215,
        },
        [Rarities.ULTRA]: {
            health: 36500,
            bodyDamage: 3645,
        },
        [Rarities.SUPER]: {
            health: 656000,
            bodyDamage: 10935,
        },
    },

    [MobType.CENTIPEDE]: {
        name: "Centipede",
        description: "It's just there doing its thing.",
        baseSize: 40,
        fraction: 40,
        rx: 40,
        ry: 40,
        [Rarities.COMMON]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarities.UNUSUAL]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarities.RARE]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarities.EPIC]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.LEGENDARY]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarities.MYTHIC]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarities.ULTRA]: {
            health: 1825000,
            bodyDamage: 7290,
        },
        [Rarities.SUPER]: {
            health: 32800000,
            bodyDamage: 21870,
        },
    },
    [MobType.CENTIPEDE_EVIL]: {
        name: "Centipede",
        description: "This one loves flowers.",
        baseSize: 40,
        fraction: 40,
        rx: 40,
        ry: 40,
        [Rarities.COMMON]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarities.UNUSUAL]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarities.RARE]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarities.EPIC]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.LEGENDARY]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarities.MYTHIC]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarities.ULTRA]: {
            health: 1825000,
            bodyDamage: 7290,
        },
        [Rarities.SUPER]: {
            health: 32800000,
            bodyDamage: 21870,
        },
    },
    [MobType.CENTIPEDE_DESERT]: {
        name: "Centipede",
        description: "Gotta go fast.",
        baseSize: 40,
        fraction: 40,
        rx: 40,
        ry: 40,
        [Rarities.COMMON]: {
            health: 25,
            bodyDamage: 10,
        },
        [Rarities.UNUSUAL]: {
            health: 93.8,
            bodyDamage: 30,
        },
        [Rarities.RARE]: {
            health: 337.5,
            bodyDamage: 90,
        },
        [Rarities.EPIC]: {
            health: 1350,
            bodyDamage: 270,
        },
        [Rarities.LEGENDARY]: {
            health: 10125,
            bodyDamage: 810,
        },
        [Rarities.MYTHIC]: {
            health: 60750,
            bodyDamage: 2430,
        },
        [Rarities.ULTRA]: {
            health: 1825000,
            bodyDamage: 7290,
        },
        [Rarities.SUPER]: {
            health: 32800000,
            bodyDamage: 21870,
        },
    },
};