import type { BrandedId, Entity, PartialUnion, UnderlyingMixinUnion } from "../Entity";
import { ON_UPDATE_TICK } from "../Entity";
import { EntityCollision } from "../EntityCollision";
import { EntityElimination } from "../EntityElimination";
import { EntityCoordinateMovement } from "../EntityCoordinateMovement";
import { EntityCoordinateBoundary } from "../EntityCoordinateBoundary";
import type { PlayerInstance } from "../Player/Player";
import { MobAggressivePursuit } from "./MobAggressivePursuit";
import { MobBodyConnection } from "./MobBodyConnection";
import { MobSpecialMovement } from "./MobSpecialMovement";
import { MobHealthRegen } from "./MobHealthRegen";
import { Rarity } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import type { PetalType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { MobType } from "../../../../../../Shared/Entity/Statics/EntityType";
import type { WavePool } from "../../../Genres/Wave/WavePool";
import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";

export type MobId = BrandedId<"Mob">;

class BaseMob implements Entity {
    /**
     * Friction of petal velocity.
     */
    private static readonly PETAL_VELOCITY_FRICTION = 0.8125;

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
    readonly rarity: Rarity;

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
     * Velocity of petal.
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
        | UnderlyingMixinUnion
        | "speed"
    >) {
        Object.assign(this, source);
    }

    [ON_UPDATE_TICK](poolThis: WavePool): void {
        const { petalVelocity: velocity } = this;

        if (!isPetal(this.type)) return;

        if (!velocity) return;

        velocity[0] *= Mob.PETAL_VELOCITY_FRICTION;
        velocity[1] *= Mob.PETAL_VELOCITY_FRICTION;

        this.x += velocity[0];
        this.y += velocity[1];
    }

    [Symbol.dispose](): void {
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

Mob = MobSpecialMovement(Mob);
Mob = MobAggressivePursuit(Mob);
Mob = MobHealthRegen(Mob);
Mob = MobBodyConnection(Mob);

Mob = EntityCollision(Mob);
Mob = EntityElimination(Mob);
Mob = EntityCoordinateBoundary(Mob);
Mob = EntityCoordinateMovement(Mob);

type MobInstance = InstanceType<typeof Mob>;

const MOB_SIZE_FACTOR = {
    [Rarity.COMMON]: 1.0,
    [Rarity.UNUSUAL]: 1.2,
    [Rarity.RARE]: 1.5,
    [Rarity.EPIC]: 1.9,
    [Rarity.LEGENDARY]: 3.0,
    [Rarity.MYTHIC]: 5.0,

    [Rarity.ULTRA]: 50,
} as const satisfies Record<Rarity, number>;

const MOB_HEALTH_FACTOR = {
    [Rarity.COMMON]: 1.0,
    [Rarity.UNUSUAL]: 2.5,
    [Rarity.RARE]: 6.3,
    [Rarity.EPIC]: 15.6,
    [Rarity.LEGENDARY]: 39.0,
    [Rarity.MYTHIC]: 100.0,

    [Rarity.ULTRA]: 50,
} as const satisfies Record<Rarity, number>;

const MOB_DAMAGE_FACTOR = {
    [Rarity.COMMON]: 1.0,
    [Rarity.UNUSUAL]: 2.0,
    [Rarity.RARE]: 4.0,
    [Rarity.EPIC]: 8.0,
    [Rarity.LEGENDARY]: 16.0,
    [Rarity.MYTHIC]: 32.0,

    [Rarity.ULTRA]: 64.0,
} as const satisfies Record<Rarity, number>;

/**
 * Define speed for each mob.
 */
const MOB_SPEED = {
    [MobType.BEE]: 3.5,
    [MobType.SPIDER]: 5,

    [MobType.CENTIPEDE]: 3.5,
    [MobType.CENTIPEDE_EVIL]: 3.5,
    [MobType.CENTIPEDE_DESERT]: 14,

    [MobType.BEETLE]: 3.5,

    [MobType.BUBBLE]: 0,
    [MobType.JELLYFISH]: 2,
    [MobType.STARFISH]: 3.5,
} as const satisfies Record<MobType, number>;

export type { MobInstance };
export { BaseMob, Mob, MOB_SIZE_FACTOR, MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR, MOB_SPEED };