import { isPetal } from "../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import type { EntityCollision } from "../../../../../Shared/Entity/Statics/EntityData";
import type { Rarity } from "../../../../../Shared/Entity/Statics/EntityRarity";
import { MobType } from "../../../../../Shared/Entity/Statics/EntityType";
import type { MobData, MobStat } from "../../../../../Shared/Entity/Statics/Mob/MobData";
import { MOB_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import type { PetalData, PetalStat } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import { PETAL_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import type { WavePool } from "../../Genres/Wave/WavePool";
import { returnGoodShape, accordinglyComputeDelta, isColliding, PLAYER_MAX_COLLISION_DELTA } from "../Statics/Collision/CollisionCollide";
import type { EntityMixinConstructor, Entity, EntityMixinTemplate, RealEntity } from "./Entity";
import { ON_UPDATE_TICK } from "./Entity";
import { calculateMaxHealth, isDeadEntity } from "./EntityElimination";
import type { MobInstance } from "./Mob/Mob";
import { Mob, MOB_SIZE_FACTOR } from "./Mob/Mob";
import { traverseMobSegments } from "./Mob/MobBodyConnection";
import type { PlayerInstance } from "./Player/Player";
import { Player } from "./Player/Player";

type TypedForEach = (callbackfn: (value: RealEntity, value2: RealEntity, set: Set<RealEntity>) => void, thisArg?: any) => void;

/**
 * Determine if stat is mob stat.
 */
export const isMobStat = (stat: PetalStat | MobStat): stat is MobStat => { return "bodyDamage" in stat; };

/**
 * Accordingly select damage from various stat.
 */
export const damageOf = (stat: PetalStat | MobStat): number => isMobStat(stat)
    ? stat.bodyDamage
    : stat.damage;

export const calculateMobSize = (profile: MobData, rarity: Rarity): number => profile.baseSize * MOB_SIZE_FACTOR[rarity];

export const FLOWER_FRACTION = 25;
export const FLOWER_ARC_RADIUS = 25;

export const FLOWER_DEFAULT_SEARCH_DATA = {
    fraction: FLOWER_FRACTION,
    rx: FLOWER_ARC_RADIUS,
    ry: FLOWER_ARC_RADIUS,
} as const satisfies Partial<EntityCollision>;

export function EntityCollision<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly BUBBLE_PUSH_FACTOR = 3;

        private static calculatePush(entity1: Entity, entity2: Entity, delta: number): [number, number] {
            const dx = entity2.x - entity1.x;
            const dy = entity2.y - entity1.y;
            const distance = Math.hypot(dx, dy);

            if (distance === 0) return;

            const nx = dx / distance;
            const ny = dy / distance;

            // Use delta as overlap
            const pushX = nx * delta;
            const pushY = ny * delta;

            return [pushX, pushY];
        }

        private static calculateSearchRadius = ({ fraction, rx, ry }: Partial<EntityCollision>, size: number): number => (rx + ry) * (size / fraction);

        [ON_UPDATE_TICK](poolThis: WavePool): void {
            super[ON_UPDATE_TICK](poolThis);

            const thisMaxHealth = calculateMaxHealth(this);

            if (this instanceof Mob) {
                // Basically mob is bigger than the player, so the mob-to-player collision are done on mob side
                // When the developer makes himself very large, mobs can get stuck in, but this is not taken into account

                const isPetalThis = isPetal(this.type);

                const profile1: MobData | PetalData = MOB_PROFILES[this.type] || PETAL_PROFILES[this.type];

                const collision1 = profile1.collision;

                const thisDamage = damageOf(profile1[this.rarity]);

                const shape1 = returnGoodShape(this);

                const searchRadius = MixedBase.calculateSearchRadius(collision1, this.size);

                const nearby = poolThis.sharedSpatialHash.search(this, searchRadius);

                (<TypedForEach>nearby.forEach)((otherEntity: MobInstance | PlayerInstance) => {
                    if (this.id === otherEntity.id) return;

                    if (isDeadEntity(poolThis, otherEntity)) return;

                    // Collide mob -> mob
                    if (otherEntity instanceof Mob) {
                        const isPetalOther = isPetal(otherEntity.type);

                        // Petal doesnt damaged/knockbacked to petal
                        if (isPetalThis && isPetalOther) return;

                        // Pet/petal doesnt damaged/knockbacked to petal/pet
                        if (isPetalThis && otherEntity.petMaster) return;
                        if (this.petMaster && isPetalOther) return;

                        const profile2: MobData | PetalData = MOB_PROFILES[otherEntity.type] || PETAL_PROFILES[otherEntity.type];

                        const shape2 = returnGoodShape(otherEntity);

                        const delta = accordinglyComputeDelta(shape1, shape2);

                        if (isColliding(delta)) {
                            const push = MixedBase.calculatePush(this, otherEntity, delta);
                            if (push) {
                                if (
                                    !this.petalIsSpinningMob &&
                                    !otherEntity.petalIsSpinningMob
                                ) {
                                    // Pop knockback to summoned mob (enemy), not including petal
                                    const bubbleMultiplierThis = otherEntity.type === MobType.BUBBLE && this.petMaster ? MixedBase.BUBBLE_PUSH_FACTOR : 1;
                                    const bubbleMultiplierOther = this.type === MobType.BUBBLE && otherEntity.petMaster ? MixedBase.BUBBLE_PUSH_FACTOR : 1;

                                    const petalMultiplierThis = isPetalThis ? 10 : 1;
                                    const petalMultiplierOther = isPetalOther ? 10 : 1;

                                    // Little knockback to mob if petal
                                    const baseMultiplierThis = isPetalOther ? 0.1 : 0.3;
                                    const baseMultiplierOther = isPetalThis ? 0.1 : 0.3;

                                    this.x -= push[0] * baseMultiplierThis * petalMultiplierThis * bubbleMultiplierThis;
                                    this.y -= push[1] * baseMultiplierThis * petalMultiplierThis * bubbleMultiplierThis;
                                    otherEntity.x += push[0] * baseMultiplierOther * petalMultiplierOther * bubbleMultiplierOther;
                                    otherEntity.y += push[1] * baseMultiplierOther * petalMultiplierOther * bubbleMultiplierOther;
                                }

                                // Pet doesnt damaged to other pet
                                if (this.petMaster && otherEntity.petMaster) return;

                                if (
                                    isPetalThis || isPetalOther ||
                                    this.petMaster || otherEntity.petMaster
                                ) {
                                    const otherEntityMaxHealth = calculateMaxHealth(otherEntity);
                                    const otherEntityDamage = damageOf(profile2[otherEntity.rarity]);

                                    this.health -= otherEntityDamage / thisMaxHealth;
                                    otherEntity.health -= thisDamage / otherEntityMaxHealth;

                                    // Dont trying to set lastAttackedEntity to petal because its not effective

                                    if (!isPetalOther) {
                                        // Propagate hit to head
                                        const maybeSegmentsHead = traverseMobSegments(poolThis, otherEntity);

                                        if (this.petalMaster) {
                                            maybeSegmentsHead.lastAttackedEntity = this.petalMaster;
                                        }

                                        if (this.petMaster) {
                                            // If pet attacked mob its target player or pet?
                                            maybeSegmentsHead.lastAttackedEntity = this.petMaster;
                                        }
                                    }

                                    if (!isPetalThis) {
                                        const maybeSegmentsHead = traverseMobSegments(poolThis, this);

                                        if (otherEntity.petalMaster) {
                                            maybeSegmentsHead.lastAttackedEntity = otherEntity.petalMaster;
                                        }

                                        if (otherEntity.petMaster) {
                                            maybeSegmentsHead.lastAttackedEntity = otherEntity.petMaster;
                                        }
                                    }
                                }
                            }
                        }

                        return;
                    }

                    // Collide mob -> player
                    if (otherEntity instanceof Player) {
                        // Dont collide to dead player
                        if (otherEntity.isDead) return;

                        if (!otherEntity.isCollidable) return;

                        if (
                            // Dont damage/knockback when petal
                            this.petalMaster ||
                            // Dont damage/knockback when pet
                            this.petMaster
                        ) return;

                        const shape2 = returnGoodShape(otherEntity);

                        const delta = accordinglyComputeDelta(shape1, shape2);

                        if (isColliding(delta)) {
                            const push = MixedBase.calculatePush(
                                this, 
                                otherEntity, 
                                Math.min(
                                    delta, 
                                    PLAYER_MAX_COLLISION_DELTA,
                                ),
                            );
                            if (push) {
                                // If this is bubble, give player more knockback
                                const bubbleMultiplier = this.type === MobType.BUBBLE ? MixedBase.BUBBLE_PUSH_FACTOR : 1;

                                this.x -= push[0];
                                this.y -= push[1];
                                otherEntity.x += push[0] * 5 * bubbleMultiplier;
                                otherEntity.y += push[1] * 5 * bubbleMultiplier;

                                // Take damage to eachother
                                const otherEntityMaxHealth = calculateMaxHealth(otherEntity);

                                this.health -= otherEntity.bodyDamage / thisMaxHealth;
                                otherEntity.health -= thisDamage / otherEntityMaxHealth;

                                const maybeSegmentsHead = traverseMobSegments(poolThis, this);

                                // Body hitted
                                maybeSegmentsHead.lastAttackedEntity = otherEntity;
                            }
                        }

                        return;
                    }
                });

                return;
            }

            if (
                this instanceof Player &&
                // Dont collide when dead
                !this.isDead &&
                this.isCollidable
            ) {
                const shape1 = returnGoodShape(this);

                const searchRadius = MixedBase.calculateSearchRadius(FLOWER_DEFAULT_SEARCH_DATA, this.size);

                const nearby = poolThis.sharedSpatialHash.search(this, searchRadius);

                (<TypedForEach>nearby.forEach)(otherEntity => {
                    if (!(otherEntity instanceof Player)) return;

                    if (this.id === otherEntity.id) return;

                    // Dont collide to dead player
                    if (otherEntity.isDead) return;

                    if (!otherEntity.isCollidable) return;

                    // Collide player -> player

                    const shape2 = returnGoodShape(otherEntity);

                    const delta = accordinglyComputeDelta(shape1, shape2);

                    if (isColliding(delta)) {
                        const push = MixedBase.calculatePush(this, otherEntity, delta);
                        if (push) {
                            this.x -= push[0] * 2;
                            this.y -= push[1] * 2;
                            otherEntity.x += push[0] * 2;
                            otherEntity.y += push[1] * 2;
                        }
                    }
                });

                return;
            }
        }
    };
}