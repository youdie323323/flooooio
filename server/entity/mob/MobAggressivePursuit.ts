import { angleToRad, isPetal } from "../utils/common";
import { Entity, onUpdateTick } from "../Entity";
import { EntityPool } from "../EntityPool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { MobType } from "../../../shared/types";
import { Player, PlayerInstance } from "../player/Player";

function predicateCoordinate(x0: number, y0: number, speed: number, angle: number, time: number) {
    const rad = angleToRad(angle);

    const newX = x0 + speed * Math.cos(rad) * time;
    const newY = y0 + speed * Math.sin(rad) * time;

    return { x: newX, y: newY };
}

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

const MOB_BEHAVIORS = {
    [MobType.STARFISH]: 'aggressive',
    [MobType.BEETLE]: 'aggressive',
    [MobType.BUBBLE]: 'immobile',
    [MobType.JELLYFISH]: 'cautious',
    [MobType.BEE]: 'neutral'
} as const

export function MobAggressivePursuit<T extends new (...args: any[]) => BaseMob>(Base: T) {
    return class extends Base {
        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            let targets: Entity[];
            if (this.parentEgger) {
                // Mob which summoned by player will attack other mobs expect petal
                targets = poolThis.getAllMobs().filter(p => !isPetal(p.type) && !p?.parentEgger);
            } else {
                // TODO: target pets
                targets = [poolThis.getAllClients().filter(p => !p.isDead), poolThis.getAllMobs().filter(p => p.parentEgger)].flat();
            }

            // Dont chase player when this is petal
            if (!isPetal(this.type)) {
                // Dont do anything while this.starfishRegeningHealth so
                // can handle angle in MobHealthRegen.ts
                if (this.starfishRegeningHealth) {
                    return;
                }

                if (this.petGoingToPlayer) {
                    return;
                }

                switch (MOB_BEHAVIORS[this.type]) {
                    case "aggressive": {
                        let distanceToTarget = 0;
                        if (this.targetEntity) {
                            const dx = this.targetEntity.x - this.x;
                            const dy = this.targetEntity.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        // Loss entity
                        if (this.targetEntity && distanceToTarget < 125 * this.size) {
                            this.targetEntity = null;
                        } else {
                            const nearestTarget = findNearestEntity(this, targets);
                            if (nearestTarget) {
                                const dx = nearestTarget.x - this.x;
                                const dy = nearestTarget.y - this.y;
                                const distance = Math.hypot(dx, dy);

                                if (distance < 100 * this.size) {
                                    const targetAngle = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 255 + 255) % 255;

                                    let currentAngle = this.angle;
                                    while (currentAngle < 0) currentAngle += 255;
                                    currentAngle = currentAngle % 255;

                                    let angleDiff = targetAngle - currentAngle;
                                    if (angleDiff > 127.5) angleDiff -= 255;
                                    if (angleDiff < -127.5) angleDiff += 255;

                                    this.angle += angleDiff * 0.1;
                                    this.angle = ((this.angle + 255) % 255);

                                    this.magnitude = 255 * 4;

                                    this.targetEntity = nearestTarget;
                                } else {
                                    this.targetEntity = null;
                                }
                            } else {
                                this.targetEntity = null;
                            }
                        }

                        break;
                    }

                    // Immobile (bubble, stone)
                    case "immobile": {
                        this.magnitude = 0;
                        break;
                    }

                    // Cautious (jellyfish)
                    case "cautious": {
                        let distanceToTarget = 0;
                        if (this.targetEntity) {
                            const dx = this.targetEntity.x - this.x;
                            const dy = this.targetEntity.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        // Loss entity
                        if (this.targetEntity && distanceToTarget > 125 * this.size) {
                            this.targetEntity = null;
                        } else {
                            const nearestTarget = findNearestEntity(this, targets);
                            if (nearestTarget) {
                                const dx = nearestTarget.x - this.x;
                                const dy = nearestTarget.y - this.y;
                                const distance = Math.hypot(dx, dy);

                                if (distance < 100 * this.size) {
                                    const targetAngle = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 255 + 255) % 255;

                                    let currentAngle = this.angle;
                                    while (currentAngle < 0) currentAngle += 255;
                                    currentAngle = currentAngle % 255;

                                    let angleDiff = targetAngle - currentAngle;
                                    if (angleDiff > 127.5) angleDiff -= 255;
                                    if (angleDiff < -127.5) angleDiff += 255;

                                    this.angle += angleDiff * 0.1;
                                    this.angle = ((this.angle + 255) % 255);

                                    this.magnitude = 255 * (this.targetEntity && distanceToTarget < 500 ? 0.25 : 2);

                                    this.targetEntity = nearestTarget;
                                } else {
                                    this.targetEntity = null;
                                }
                            } else {
                                this.targetEntity = null;
                            }
                        }

                        break;
                    }

                    // Neutral (bee)
                    case "neutral": {
                        let distanceToTarget = 0;
                        if (this.targetEntity) {
                            const dx = this.targetEntity.x - this.x;
                            const dy = this.targetEntity.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        // Loss entity
                        if (this.targetEntity && distanceToTarget > 125 * this.size) {
                            this.targetEntity = null;
                        } else {
                            if (this.lastAttacked && !(this.lastAttacked instanceof Player ? this.lastAttacked.isDead : /* If mob is dead, its simply deleted from pool so can use false */ false)) {
                                const dx = this.lastAttacked.x - this.x;
                                const dy = this.lastAttacked.y - this.y;

                                const targetAngle = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 255 + 255) % 255;

                                let currentAngle = this.angle;
                                while (currentAngle < 0) currentAngle += 255;
                                currentAngle = currentAngle % 255;

                                let angleDiff = targetAngle - currentAngle;
                                if (angleDiff > 127.5) angleDiff -= 255;
                                if (angleDiff < -127.5) angleDiff += 255;

                                this.angle += angleDiff * 0.1;
                                this.angle = ((this.angle + 255) % 255);

                                this.magnitude = 255 * 5;

                                this.targetEntity = this.lastAttacked;
                            } else {
                                this.targetEntity = null;
                            }
                        }

                        break;
                    }
                }
            }
        }
    };
}