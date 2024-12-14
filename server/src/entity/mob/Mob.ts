import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { BaseEntityData, BrandedId, Entity } from "../Entity";
import { MobDynamicMovement } from "./MobDynamicMovement";
import { MobAggressivePursuit } from "./MobAggressivePursuit";
import { EntityLinearMovement } from "../EntityLinearMovement";
import { BasePlayer, PlayerInstance } from "../player/Player";
import { MobHealthRegen } from "./MobHealthRegen";
import { EntityMapBoundary } from "../EntityMapBoundary";
import { EntityDeath } from "../EntityDeath";
import { MobBodyConnection } from "./MobBodyConnection";
import { MobType, PetalType } from "../../../../shared/EntityType";
import { Rarities } from "../../../../shared/rarity";

export type MobId = BrandedId<"Mob">;

class BaseMob implements Entity {
    /**
     * Base speed of mob.
     * 
     * @remarks
     * 
     * These are test values for the beta phase, and the actual speeds are for each mob.
     */
    public static readonly BASE_SPEED = 3.5;

    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;

    /**
     * Id of mob.
     * 
     * @readonly
     */
    readonly id: MobId;

    /**
     * Type of mob/petal.
     * 
     * @readonly
     */
    readonly type: MobType | PetalType;

    /**
     * Rarity of mob/petal.
     * 
     * @readonly
     */
    readonly rarity: Rarities;

    /**
     * Current target entity.
     */
    targetEntity: Entity | null;

    /**
     * Entity instance which last attacked this.
     */
    lastAttackedEntity: Entity | null;

    /**
     * Player which owner of this pet.
     */
    petMaster: PlayerInstance | null;
    /**
     * Whether the pet is moving to tracking the player.
     * 
     * @remarks
     * 
     * To prevent move from MobOscillatingMovement.ts.
     */
    petGoingToMaster: boolean;

    /**
     * Player which owns this petal.
     */
    petalMaster: PlayerInstance | null;
    /**
     * Mob that usage petal spawned.
     * Always null if petalIsUsage is false.
     */
    petalSummonedPet: MobInstance | null;

    /**
     * Determines if starfish is running for regen.
     */
    starfishRegeningHealth: boolean;

    /**
     * Connected mob instance.
     */
    connectingSegment: MobInstance | null;
    /**
     * This is segments head or not.
     * 
     * @readonly
     */
    readonly isFirstSegment: boolean;

    constructor(source: Required<BaseMob>) {
        Object.assign(this, source);
    }
}

let Mob = BaseMob;

Mob = MobDynamicMovement(Mob);
Mob = MobAggressivePursuit(Mob);
Mob = MobHealthRegen(Mob);
Mob = MobBodyConnection(Mob);

Mob = EntityCollisionResponse(Mob);
Mob = EntityDeath(Mob);
Mob = EntityMapBoundary(Mob);
Mob = EntityLinearMovement(Mob);

type MobInstance = InstanceType<typeof Mob>;

type MobStat = Readonly<{
    bodyDamage: number;
    health: number;
    
    [key: string]: any;
}>;

type MobData = BaseEntityData & Readonly<{
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
}>;

const MOB_SIZE_FACTOR = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 1.2,
    [Rarities.RARE]: 1.5,
    [Rarities.EPIC]: 1.9,
    [Rarities.LEGENDARY]: 3.0,
    [Rarities.MYTHIC]: 5.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
} satisfies Record<Rarities, number>;

const MOB_HEALTH_FACTOR = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 2.5,
    [Rarities.RARE]: 6.3,
    [Rarities.EPIC]: 15.6,
    [Rarities.LEGENDARY]: 39.0,
    [Rarities.MYTHIC]: 100.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
} satisfies Record<Rarities, number>;

const MOB_DAMAGE_FACTOR = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 2.0,
    [Rarities.RARE]: 4.0,
    [Rarities.EPIC]: 8.0,
    [Rarities.LEGENDARY]: 16.0,
    [Rarities.MYTHIC]: 32.0,

    [Rarities.ULTRA]: 64.0,
    [Rarities.SUPER]: 128.0,
} satisfies Record<Rarities, number>;

export { BaseMob, Mob, MobData, MobStat, MobInstance, MOB_SIZE_FACTOR, MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR };