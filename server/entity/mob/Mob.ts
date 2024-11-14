import { MobType, PetalType } from "../../../shared/types";
import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { Entity } from "../Entity";
import { MobOscillatingMovement } from "./MobOscillatingMovement";
import { MobAggressivePursuit } from "./MobAggressivePursuit";
import { EntityLinearMovement } from "../EntityLinearMovement";
import { EntityChecksum } from "../EntityChecksum";
import { Rarities } from "../../../shared/rarities";
import { BasePlayer, PlayerInstance } from "../player/Player";
import { MobHealthRegen } from "./MobHealthRegen";

class BaseMob implements Entity {
    readonly id: number;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;

    /**
     * Type of mob/petal.
     */
    type: MobType | PetalType;

    /**
     * Rarity of mob/petal.
     */
    rarity: Rarities;

    /**
     * Current target entity of mob.
     * Always null if petal.
     */
    mobTargetEntity: Entity | null;
    /**
     * Current target entity of mob.
     * Always null if petal.
     */
    mobLastAttackedBy: Entity | null;

    /**
     * Player which owner of this pet.
     */
    petParentPlayer: PlayerInstance | null;

    /**
     * Determines if petal is usage petal. (e.g. beetle egg)
     */
    petalIsUsage: boolean;
    /**
     * Player which owns this petal.
     */
    petalParentPlayer: PlayerInstance | null;
    /**
     * Mob that usage petal spawned.
     * Always false if petalIsUsage is false.
     */
    petalSummonedPet: MobInstance | null;

    /**
     * Determines if starfish is running for regen.
     */
    starfishRegeningHealth: boolean;

    constructor(source: Required<BaseMob>) {
        Object.assign(this, source);
    }
}

let Mob = BaseMob;
Mob = EntityCollisionResponse(Mob);
Mob = EntityLinearMovement(Mob);
Mob = EntityChecksum(Mob);
Mob = MobOscillatingMovement(Mob);
Mob = MobAggressivePursuit(Mob);
Mob = MobHealthRegen(Mob);

type MobInstance = InstanceType<typeof Mob>;

interface MobStat {
    bodyDamage: number;
    health: number;
    [key: string]: any;
}

interface MobData {
    name: string;
    description: string;
    fraction: number;
    rx: number;
    ry: number;

    baseSize: number;

    // TODO: replace these with MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR

    [Rarities.COMMON]: MobStat;
    [Rarities.UNUSUAL]: MobStat;
    [Rarities.RARE]: MobStat;
    [Rarities.EPIC]: MobStat;
    [Rarities.LEGENDARY]: MobStat;
    [Rarities.MYTHIC]: MobStat;
    [Rarities.ULTRA]: MobStat;
    [Rarities.SUPER]: MobStat;
}

const MOB_SIZE_FACTOR: Record<Rarities, number> = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 1.2,
    [Rarities.RARE]: 1.5,
    [Rarities.EPIC]: 1.9,
    [Rarities.LEGENDARY]: 3.0,
    [Rarities.MYTHIC]: 5.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
};

const MOB_HEALTH_FACTOR: Record<Rarities, number> = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 2.5,
    [Rarities.RARE]: 6.3,
    [Rarities.EPIC]: 15.6,
    [Rarities.LEGENDARY]: 39.0,
    [Rarities.MYTHIC]: 100.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
};

const MOB_DAMAGE_FACTOR: Record<Rarities, number> = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 2.0,
    [Rarities.RARE]: 4.0,
    [Rarities.EPIC]: 8.0,
    [Rarities.LEGENDARY]: 16.0,
    [Rarities.MYTHIC]: 32.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
};

export { BaseMob, Mob, MobData, MobStat, MobInstance, MOB_SIZE_FACTOR, MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR };