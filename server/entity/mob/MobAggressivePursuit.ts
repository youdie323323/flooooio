import { angleToRad, isPetal, TWO_PI } from "../../utils/common";
import { Entity, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { EntityPool } from "../EntityPool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { MobType } from "../../../shared/types";
import { Player, PlayerInstance } from "../player/Player";

export function findNearestEntity(me: Entity, entites: Entity[]) {
    if (!entites.length) return null;

    return entites.reduce((nearest, current) => {
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

const MOB_DETECTION_FACTOR = 25;

enum MobBehaviors {
    AGGRESSIVE,
    PASSIVE,
    CAUTIONS,
    NEUTRAL,
}

const MOB_BEHAVIORS: Record<MobType, MobBehaviors> = {
    [MobType.STARFISH]: MobBehaviors.AGGRESSIVE,
    [MobType.BEETLE]: MobBehaviors.AGGRESSIVE,
    [MobType.BUBBLE]: MobBehaviors.PASSIVE,
    [MobType.JELLYFISH]: MobBehaviors.CAUTIONS,
    [MobType.BEE]: MobBehaviors.NEUTRAL
} as const;

export function MobAggressivePursuit<T extends new (...args: any[]) => BaseMob>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            let targets: Entity[];
            if (this.petParentPlayer) {
                // Mob which summoned by player will attack other mobs expect petals, pets
                targets = poolThis.getAllMobs().filter(p => !isPetal(p.type) && !p?.petParentPlayer);
            } else {
                // Target living players, p̶e̶t̶s̶
                // Mob will never target pets before wave
                targets = poolThis.getAllClients().filter(p => !p.isDead);
            }

            // Dont chase player when this is petal
            if (!isPetal(this.type)) {
                // Dont do anything while this.starfishRegeningHealth so
                // can handle angle in MobHealthRegen.ts
                if (this.starfishRegeningHealth) {
                    return;
                }

                switch (MOB_BEHAVIORS[this.type]) {
                    // Aggressive
                    case MobBehaviors.AGGRESSIVE: {
                        let distanceToTarget = 0;
                        if (this.mobTargetEntity) {
                            const dx = this.mobTargetEntity.x - this.x;
                            const dy = this.mobTargetEntity.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        // Loss entity
                        if (this.mobTargetEntity && distanceToTarget > (MOB_DETECTION_FACTOR + 25) * this.size) {
                            this.mobTargetEntity = null;
                        } else {
                            const nearestTarget = findNearestEntity(this, targets);
                            if (nearestTarget) {
                                const dx = nearestTarget.x - this.x;
                                const dy = nearestTarget.y - this.y;
                                const distance = Math.hypot(dx, dy);

                                if (distance < MOB_DETECTION_FACTOR * this.size) {
                                    const targetAngle = ((Math.atan2(dy, dx) / TWO_PI) * 255 + 255) % 255;

                                    let currentAngle = this.angle;
                                    while (currentAngle < 0) currentAngle += 255;
                                    currentAngle = currentAngle % 255;

                                    let angleDiff = targetAngle - currentAngle;
                                    if (angleDiff > 127.5) angleDiff -= 255;
                                    if (angleDiff < -127.5) angleDiff += 255;

                                    this.angle += angleDiff * 0.1;
                                    this.angle = ((this.angle + 255) % 255);

                                    this.magnitude = 255 * 4;

                                    this.mobTargetEntity = nearestTarget;
                                } else {
                                    this.mobTargetEntity = null;
                                }
                            } else {
                                this.mobTargetEntity = null;
                            }
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
                        let distanceToTarget = 0;
                        if (this.mobTargetEntity) {
                            const dx = this.mobTargetEntity.x - this.x;
                            const dy = this.mobTargetEntity.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        // Loss entity
                        if (this.mobTargetEntity && distanceToTarget > (MOB_DETECTION_FACTOR + 25) * this.size) {
                            this.mobTargetEntity = null;
                        } else {
                            const nearestTarget = findNearestEntity(this, targets);
                            if (nearestTarget) {
                                const dx = nearestTarget.x - this.x;
                                const dy = nearestTarget.y - this.y;
                                const distance = Math.hypot(dx, dy);

                                if (distance < MOB_DETECTION_FACTOR * this.size) {
                                    const targetAngle = ((Math.atan2(dy, dx) / TWO_PI) * 255 + 255) % 255;

                                    let currentAngle = this.angle;
                                    while (currentAngle < 0) currentAngle += 255;
                                    currentAngle = currentAngle % 255;

                                    let angleDiff = targetAngle - currentAngle;
                                    if (angleDiff > 127.5) angleDiff -= 255;
                                    if (angleDiff < -127.5) angleDiff += 255;

                                    this.angle += angleDiff * 0.1;
                                    this.angle = ((this.angle + 255) % 255);

                                    this.magnitude = 255 * (this.mobTargetEntity && distanceToTarget < 300 ? 0 : 2);

                                    this.mobTargetEntity = nearestTarget;
                                } else {
                                    this.mobTargetEntity = null;
                                }
                            } else {
                                this.mobTargetEntity = null;
                            }
                        }

                        break;
                    }

                    // Neutral
                    case MobBehaviors.NEUTRAL: {
                        let distanceToTarget = 0;
                        if (this.mobTargetEntity) {
                            const dx = this.mobTargetEntity.x - this.x;
                            const dy = this.mobTargetEntity.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        // Loss entity
                        if (this.mobTargetEntity && distanceToTarget > (MOB_DETECTION_FACTOR + 25) * this.size) {
                            this.mobTargetEntity = null;
                        } else {
                            // Switch to other entity if last attacked entity is dead
                            if (this.mobLastAttackedBy &&
                                (
                                    // Player dead, stop target
                                    (this.mobLastAttackedBy instanceof Player && this.mobLastAttackedBy.isDead) ||
                                    // Mob dead, stop target
                                    (this.mobLastAttackedBy instanceof Mob && !poolThis.getMob(this.mobLastAttackedBy.id))
                                )
                            ) {
                                this.mobLastAttackedBy = null;
                                return;
                            }

                            if (this.mobLastAttackedBy) {
                                const dx = this.mobLastAttackedBy.x - this.x;
                                const dy = this.mobLastAttackedBy.y - this.y;

                                const targetAngle = ((Math.atan2(dy, dx) / TWO_PI) * 255 + 255) % 255;

                                let currentAngle = this.angle;
                                while (currentAngle < 0) currentAngle += 255;
                                currentAngle = currentAngle % 255;

                                let angleDiff = targetAngle - currentAngle;
                                if (angleDiff > 127.5) angleDiff -= 255;
                                if (angleDiff < -127.5) angleDiff += 255;

                                this.angle += angleDiff * 0.1;
                                this.angle = ((this.angle + 255) % 255);

                                this.magnitude = 255 * 5;

                                this.mobTargetEntity = this.mobLastAttackedBy;
                            } else {
                                this.mobTargetEntity = null;
                            }
                        }

                        break;
                    }
                }
            }
        }
        
        free() {
            if (super["free"]) {
                super["free"]();
            }
        }
    };
}