import { angleToRad, isPetal } from "../utils/small";
import { Entity, onUpdateTick } from "../Entity";
import { EntityPool } from "../EntityPool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { MobType } from "../../../shared/types";
import { PlayerInstance } from "../player/Player";

function predicateCoordinate(x0: number, y0: number, speed: number, angle: number, time: number) {
    const rad = angleToRad(angle);

    const newX = x0 + speed * Math.cos(rad) * time;
    const newY = y0 + speed * Math.sin(rad) * time;

    return { x: newX, y: newY };
}

export function findNearestEntity<T extends PlayerInstance | MobInstance>(target: Entity, players: T[]) {
    if (!players.length) return null;

    return players.reduce((nearest, current) => {
        const distanceToCurrent = Math.hypot(
            current.x - target.x,
            current.y - target.y
        );

        const distanceToNearest = Math.hypot(
            nearest.x - target.x,
            nearest.y - target.y
        );

        return distanceToCurrent < distanceToNearest ? current : nearest;
    });
}

export function MobAggressivePursuit<T extends new (...args: any[]) => BaseMob>(Base: T) {
    return class extends Base {
        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Dont chase player when this is petal
            if (!isPetal(this.type)) {
                switch (this.type) {
                    case MobType.JELLYFISH:
                    case MobType.STARFISH: {
                        let distanceToTarget = 0;
                        if (this.targetPlayer) {
                            const dx = this.targetPlayer.x - this.x;
                            const dy = this.targetPlayer.y - this.y;
                            distanceToTarget = Math.hypot(dx, dy);
                        }

                        if (this.targetPlayer && distanceToTarget > 5000) {
                            // Lose sight of player, switch to other player
                            this.targetPlayer = null;
                        } else {
                            const nearestPlayer = findNearestEntity(this, poolThis.getAllClients().filter(p => !p.isDead));
                            if (nearestPlayer) {
                                const dx = nearestPlayer.x - this.x;
                                const dy = nearestPlayer.y - this.y;
                                const distance = Math.hypot(dx, dy);

                                const targetAngle = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 255 + 255) % 255;

                                if (distance < 3000) {
                                    let currentAngle = this.angle;
                                    while (currentAngle < 0) currentAngle += 255;
                                    currentAngle = currentAngle % 255;

                                    let angleDiff = targetAngle - currentAngle;
                                    if (angleDiff > 127.5) angleDiff -= 255;
                                    if (angleDiff < -127.5) angleDiff += 255;

                                    this.angle += angleDiff * 0.1;
                                    this.angle = ((this.angle + 255) % 255);

                                    this.magnitude = 255 * 5;

                                    this.targetPlayer = nearestPlayer;
                                } else {
                                    this.targetPlayer = null;
                                }
                            } else {
                                this.targetPlayer = null;
                            }
                        }
                        break;
                    }
                }
            }
        }
    };
}