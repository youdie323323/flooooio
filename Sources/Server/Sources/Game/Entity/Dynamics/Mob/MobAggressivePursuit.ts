import { MobType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { WavePool } from "../../../Genres/Wave/WavePool";
import { isPetal, isBody, isDeadEntity } from "../../../Utils/common";
import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { BaseMob } from "./Mob";

export function findNearestEntity<T extends Entity>(me: T, entities: T[]): T | null {
    if (!entities.length) return null;

    return entities.reduce((nearest, current) => {
        const distanceToCurrent = Math.hypot(
            current.x - me.x,
            current.y - me.y,
        );

        const distanceToNearest = Math.hypot(
            nearest.x - me.x,
            nearest.y - me.y,
        );

        return distanceToCurrent < distanceToNearest ? current : nearest;
    });
}

export function turnAngleToTarget(thisAngle: number, dx: number, dy: number): number {
    const targetAngle = (Math.atan2(dy, dx) * 40.549) % 255; // 255/(2*PI)≈40.549
    const normalizedAngle = ((thisAngle % 255) + 255) % 255;
    let angleDiff = targetAngle - normalizedAngle;

    if (angleDiff > 127.5) angleDiff -= 255;
    else if (angleDiff < -127.5) angleDiff += 255;

    return ((normalizedAngle + angleDiff * 0.1 + 255) % 255);
}

const MOB_DETECTION_RANGE = 25;

export enum MobBehavior {
    Aggressive,
    Passive,
    Cautions,
    Neutral,
    None,
}

export const MOB_BEHAVIORS = {
    [MobType.Starfish]: MobBehavior.Aggressive,
    [MobType.Beetle]: MobBehavior.Aggressive,
    [MobType.Bubble]: MobBehavior.Passive,
    [MobType.Jellyfish]: MobBehavior.Cautions,
    [MobType.Bee]: MobBehavior.Neutral,
    [MobType.Spider]: MobBehavior.Aggressive,

    [MobType.Centipede]: MobBehavior.None,
    // TODO: elucidate desert centipede move
    [MobType.CentipedeDesert]: MobBehavior.Neutral,
    [MobType.CentipedeEvil]: MobBehavior.Aggressive,
} satisfies Record<MobType, MobBehavior>;

export function MobAggressivePursuit<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            // Dont chase player when this is petal
            if (isPetal(this.type)) return;

            // If body, dont do anything
            if (isBody(poolThis, this)) return;

            // Dont do anything while this.starfishRegeningHealth so
            // can handle angle in MobHealthRegen.ts
            if (this.starfishRegeningHealth) return;

            // Target entity dead, stop target
            if (this.targetEntity && isDeadEntity(poolThis, this.targetEntity)) this.targetEntity = null;

            // Last attacked entity dead, stop target
            if (this.lastAttackedEntity && isDeadEntity(poolThis, this.lastAttackedEntity)) this.lastAttackedEntity = null;

            let distanceToTarget = 0;
            if (this.targetEntity) {
                const dx = this.targetEntity.x - this.x;
                const dy = this.targetEntity.y - this.y;
                distanceToTarget = Math.hypot(dx, dy);
            }

            // Lose entity
            if (distanceToTarget > this.loseRange) this.targetEntity = null;

            // Select target
            let targets: Entity[];

            if (this.petMaster) {
                // Mob which summoned by player will attack other mobs expect me, petals and pets
                targets = poolThis.getAllMobs().filter(p =>
                    !(
                        p.id === this.id ||
                        isPetal(p.type) ||
                        p.petMaster
                    ),
                );
            } else {
                // Target living players, p̶e̶t̶s̶
                // Mob will never target pets before wave
                targets = poolThis.getAllClients().filter(p => !p.isDead);
            }

            switch (MOB_BEHAVIORS[this.type]) {
                // Aggressive
                case MobBehavior.Aggressive: {
                    const targetableEntity = this.targetEntity || findNearestEntity(this, targets);
                    if (targetableEntity) {
                        const dx = targetableEntity.x - this.x;
                        const dy = targetableEntity.y - this.y;
                        const distance = Math.hypot(dx, dy);

                        if (distance < this.detectionRange) {
                            this.angle = turnAngleToTarget(
                                this.angle,
                                dx,
                                dy,
                            );

                            this.magnitude = 255 * this.speed;

                            this.targetEntity = targetableEntity;
                        } else {
                            this.targetEntity = null;
                        }
                    } else {
                        this.targetEntity = null;
                    }

                    break;
                }

                // Cautious (jellyfish)
                case MobBehavior.Cautions: {
                    const targetableEntity = this.targetEntity || findNearestEntity(this, targets);
                    if (targetableEntity) {
                        const dx = targetableEntity.x - this.x;
                        const dy = targetableEntity.y - this.y;
                        const distance = Math.hypot(dx, dy);

                        if (distance < this.detectionRange) {
                            this.angle = turnAngleToTarget(
                                this.angle,
                                dx,
                                dy,
                            );

                            this.magnitude = 255 * (this.targetEntity && distanceToTarget < (3 * this.size) ? 0 : 2);

                            this.targetEntity = targetableEntity;
                        } else {
                            this.targetEntity = null;
                        }
                    } else {
                        this.targetEntity = null;
                    }

                    break;
                }

                // Passive (bubble, stone)
                case MobBehavior.Passive: {
                    this.magnitude = 0;

                    break;
                }

                // Neutral (bee)
                case MobBehavior.Neutral: {
                    if (this.lastAttackedEntity) {
                        const dx = this.lastAttackedEntity.x - this.x;
                        const dy = this.lastAttackedEntity.y - this.y;

                        this.angle = turnAngleToTarget(
                            this.angle,
                            dx,
                            dy,
                        );

                        this.magnitude = 255 * this.speed;

                        this.targetEntity = this.lastAttackedEntity;
                    } else {
                        this.targetEntity = null;
                    }

                    break;
                }

                // Do nothing
                case MobBehavior.None: break;
            }
        }

        /**
         * Get detection range within mob.
         */
        get detectionRange(): number {
            return MOB_DETECTION_RANGE * this.size;
        }

        /**
         * Get lose range within mob.
         */
        get loseRange(): number {
            return (MOB_DETECTION_RANGE * 2) * this.size;
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}