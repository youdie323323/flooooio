import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { BaseEntityData, BrandedId, Entity, onUpdateTick, PartialUnion, UnderlyingMixinUnion } from "../Entity";
import { MobDynamicMovement } from "./MobDynamicMovement";
import { MobAggressivePursuit } from "./MobAggressivePursuit";
import { EntityLinearMovement } from "../EntityLinearMovement";
import { PlayerInstance } from "../Player/Player";
import { MobHealthRegen } from "./MobHealthRegen";
import { EntityMapBoundary } from "../EntityMapBoundary";
import { EntityDeath } from "../EntityDeath";
import { MobBodyConnection } from "./MobBodyConnection";
import { MobType, PetalType } from "../../../../Shared/EntityType";
import { Rarities } from "../../../../Shared/rarity";
import { WavePool } from "../../Wave/WavePool";

export type MobId = BrandedId<"Mob">;

class BaseMob implements Entity {
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;

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
     * Petal is spinning on mob or not.
     */
    petalIsSpinningMob: boolean;

    /**
     * Velocity for friction of petal.
     */
    petalVelocity: [number, number] | null;

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

    constructor(source: PartialUnion<
        BaseMob,
        // No need to implement underlying methods
        UnderlyingMixinUnion
        | "speed"
    >) {
        Object.assign(this, source);
    }

    // Underlying EntityMixinTemplate to prevent error

    [onUpdateTick](poolThis: WavePool): void { }

    dispose(): void {
        this.targetEntity = null;
        this.lastAttackedEntity = null;

        this.petMaster = null;

        this.petalMaster = null;
        this.petalSummonedPet = null;

        this.petalVelocity = null;

        this.connectingSegment = null;
    }

    /**
     * Returns speed within mob.
     */
    get speed(): number {
        return MOB_SPEED[this.type];
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

interface MobI18n {
    name: string;
    description: string;
}

type MobData = Readonly<
    | BaseEntityData<MobI18n>
    & {
        baseSize: number;

        // TODO: replace these with MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR

        [Rarities.Common]: MobStat;
        [Rarities.Unusual]: MobStat;
        [Rarities.Rare]: MobStat;
        [Rarities.Epic]: MobStat;
        [Rarities.Legendary]: MobStat;
        [Rarities.Mythic]: MobStat;
        [Rarities.Ultra]: MobStat;
    }
>;

const MOB_SIZE_FACTOR = {
    [Rarities.Common]: 1.0,
    [Rarities.Unusual]: 1.2,
    [Rarities.Rare]: 1.5,
    [Rarities.Epic]: 1.9,
    [Rarities.Legendary]: 3.0,
    [Rarities.Mythic]: 5.0,

    [Rarities.Ultra]: 50,
} satisfies Record<Rarities, number>;

const MOB_HEALTH_FACTOR = {
    [Rarities.Common]: 1.0,
    [Rarities.Unusual]: 2.5,
    [Rarities.Rare]: 6.3,
    [Rarities.Epic]: 15.6,
    [Rarities.Legendary]: 39.0,
    [Rarities.Mythic]: 100.0,

    [Rarities.Ultra]: 50,
} satisfies Record<Rarities, number>;

const MOB_DAMAGE_FACTOR = {
    [Rarities.Common]: 1.0,
    [Rarities.Unusual]: 2.0,
    [Rarities.Rare]: 4.0,
    [Rarities.Epic]: 8.0,
    [Rarities.Legendary]: 16.0,
    [Rarities.Mythic]: 32.0,

    [Rarities.Ultra]: 64.0,
} satisfies Record<Rarities, number>;

/**
 * Define speed for each mob.
 */
const MOB_SPEED = {
    [MobType.Bee]: 3.5,
    [MobType.Spider]: 5,

    [MobType.Centipede]: 3.5,
    [MobType.CentipedeEvil]: 3.5,

    [MobType.Beetle]: 3.5,
    [MobType.CentipedeDesert]: 8,

    [MobType.Bubble]: 0,
    [MobType.Jellyfish]: 3.5,
    [MobType.Starfish]: 3.5,
} satisfies Record<MobType, number>;

export { BaseMob, Mob, MobData, MobStat, MobInstance, MOB_SIZE_FACTOR, MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR, MOB_SPEED };