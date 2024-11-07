import { angleToRad, isPetal } from "../utils/small";
import { Entity, onUpdateTick } from "../Entity";
import { EntityPool } from "../EntityPool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { MobType } from "../../../shared/types";
import { Player, PlayerInstance } from "../player/Player";

export function MobHealthRegen<T extends new (...args: any[]) => BaseMob>(Base: T) {
    return class extends Base {
        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.starfishRegeningHealth || (this.type === MobType.STARFISH && this.health < this.maxHealth / 2)) {
                this.starfishRegeningHealth = true;
                // Hmm maybe i shouldnt use size here
                this.health = Math.min(this.maxHealth, this.health + (10 * this.size));
                // Running away from player
                if (this.targetEntity) {
                    const dx = this.targetEntity.x - this.x;
                    const dy = this.targetEntity.y - this.y;

                    const targetAngle = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 255 + 255) % 255;

                    let currentAngle = this.angle;
                    while (currentAngle < 0) currentAngle += 255;
                    currentAngle = currentAngle % 255;

                    let angleDiff = targetAngle - currentAngle;
                    if (angleDiff > 127.5) angleDiff -= 255;
                    if (angleDiff < -127.5) angleDiff += 255;

                    this.angle -= angleDiff * 0.1;
                    this.angle = ((this.angle + 255) % 255);

                    this.magnitude = 255 * 4;
                }
                if (this.health >= this.maxHealth) {
                    this.starfishRegeningHealth = false;
                }
            }
        }
    };
}