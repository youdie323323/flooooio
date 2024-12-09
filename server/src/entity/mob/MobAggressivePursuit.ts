import { angleToRad, traverseMobSegment, isPetal, isBody } from "../../utils/common";
import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { Player, PlayerInstance } from "../player/Player";
import { MobType } from "../../../../shared/enum";
import { memo } from "../../../../shared/utils/memoize";

const TAU = Math.PI * 2;

export function findNearestEntity<T extends Entity>(me: T, entities: T[]) {
    if (!entities.length) return null;

    return entities.reduce((nearest, current) => {
        const distanceToCurrent = Math.hypot(
            current.x - me.x,
            current.y - me.y
        );

        const distanceToNearest = Math.hypot(
            nearest.x - me.x,
            nearest.y - me.y
        );

        return distanceToCurrent < distanceToNearest ? current : nearest;
    });
}

export const turnAngleToTarget = memo((thisAngle: number, dx: number, dy: number): number => {
    const targetAngle = ((Math.atan2(dy, dx) / TAU) * 255 + 255) % 255;

    while (thisAngle < 0) thisAngle += 255;
    thisAngle = thisAngle % 255;

    let angleDiff = targetAngle - thisAngle;
    if (angleDiff > 127.5) angleDiff -= 255;
    if (angleDiff < -127.5) angleDiff += 255;

    const newAngle = thisAngle + angleDiff * 0.1;
    return ((newAngle + 255) % 255);
});

const MOB_DETECTION_FACTOR = 25;

export enum MobBehaviors {
    AGGRESSIVE,
    PASSIVE,
    CAUTIONS,
    NEUTRAL,
    NONE,
}

export const MOB_BEHAVIORS: Record<MobType, MobBehaviors> = {
    [MobType.STARFISH]: MobBehaviors.AGGRESSIVE,
    [MobType.BEETLE]: MobBehaviors.AGGRESSIVE,
    [MobType.BUBBLE]: MobBehaviors.PASSIVE,
    [MobType.JELLYFISH]: MobBehaviors.CAUTIONS,
    [MobType.BEE]: MobBehaviors.NEUTRAL,

    [MobType.CENTIPEDE]: MobBehaviors.NONE,
    // TODO: elucidate desert centipede move
    [MobType.CENTIPEDE_DESERT]: MobBehaviors.NEUTRAL,
    [MobType.CENTIPEDE_EVIL]: MobBehaviors.AGGRESSIVE,
} as const;

export function MobAggressivePursuit<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Dont chase player when this is petal
            if (isPetal(this.type)) return;

            // If body, dont do anything
            if (isBody(poolThis, this)) return;

            // Dont do anything while this.starfishRegeningHealth so
            // can handle angle in MobHealthRegen.ts
            if (this.starfishRegeningHealth) return;

            let distanceToTarget = 0;
            if (this.mobTargetEntity) {
                const dx = this.mobTargetEntity.x - this.x;
                const dy = this.mobTargetEntity.y - this.y;
                distanceToTarget = Math.hypot(dx, dy);
            }

            // Loss entity
            if (this.mobTargetEntity && distanceToTarget > (MOB_DETECTION_FACTOR + 25) * this.size) {
                this.mobTargetEntity = null;
            }

            // Select target
            let targets: Entity[];
            if (this.petMaster) {
                // Mob which summoned by player will attack other mobs expect petals, pets
                targets = poolThis.getAllMobs().filter(p => !isPetal(p.type) && !p?.petMaster);
            } else {
                // Target living players, p̶e̶t̶s̶
                // Mob will never target pets before wave
                targets = poolThis.getAllClients().filter(p => !p.isDead);
            }

            switch (MOB_BEHAVIORS[this.type]) {
                // Aggressive
                case MobBehaviors.AGGRESSIVE: {
                    const nearestTarget = findNearestEntity(this, targets);
                    if (nearestTarget) {
                        const dx = nearestTarget.x - this.x;
                        const dy = nearestTarget.y - this.y;
                        const distance = Math.hypot(dx, dy);

                        if (distance < MOB_DETECTION_FACTOR * this.size) {
                            this.angle = turnAngleToTarget(
                                this.angle,
                                dx,
                                dy,
                            );

                            this.magnitude = 255 * Mob.BASE_SPEED;

                            this.mobTargetEntity = nearestTarget;
                        } else {
                            this.mobTargetEntity = null;
                        }
                    } else {
                        this.mobTargetEntity = null;
                    }

                    break;
                }

                // Immobile (bubble, stone)
                case MobBehaviors.PASSIVE: {
                    this.magnitude = 0;

                    break;
                }

                // Cautious (jellyfish)
                case MobBehaviors.CAUTIONS: {
                    const nearestTarget = findNearestEntity(this, targets);
                    if (nearestTarget) {
                        const dx = nearestTarget.x - this.x;
                        const dy = nearestTarget.y - this.y;
                        const distance = Math.hypot(dx, dy);

                        if (distance < MOB_DETECTION_FACTOR * this.size) {
                            this.angle = turnAngleToTarget(
                                this.angle,
                                dx,
                                dy,
                            );

                            this.magnitude = 255 * (this.mobTargetEntity && distanceToTarget < (3 * this.size) ? 0 : 2);
                            
                            this.mobTargetEntity = nearestTarget;
                        } else {
                            this.mobTargetEntity = null;
                        }
                    } else {
                        this.mobTargetEntity = null;
                    }


                    break;
                }

                // Neutral
                case MobBehaviors.NEUTRAL: {
                    // Switch to other entity if last attacked entity is dead
                    if (this.mobLastAttackedBy &&
                        (
                            // Player dead, stop target them
                            (this.mobLastAttackedBy instanceof Player && this.mobLastAttackedBy.isDead) ||
                            // Mob dead, stop target them
                            (this.mobLastAttackedBy instanceof Mob && !poolThis.getMob(this.mobLastAttackedBy.id))
                        )
                    ) {
                        this.mobLastAttackedBy = null;

                        return;
                    }

                    if (this.mobLastAttackedBy) {
                        this.angle = turnAngleToTarget(
                            this.angle,
                            // Dx, dy
                            this.mobLastAttackedBy.x - this.x,
                            this.mobLastAttackedBy.y - this.y,
                        );

                        this.magnitude = 255 * Mob.BASE_SPEED;

                        this.mobTargetEntity = this.mobLastAttackedBy;
                    } else {
                        this.mobTargetEntity = null;
                    }

                    break;
                }

                // Do nothing
                case MobBehaviors.NONE: {
                    break;
                }
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }

            this.mobTargetEntity = null;
            this.mobLastAttackedBy = null;

            this.petMaster = null;

            this.petalMaster = null;
            this.petalSummonedPet = null;
        }
    };
}