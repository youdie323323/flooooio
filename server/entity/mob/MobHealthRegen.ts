import { Entity, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { Player, PlayerInstance } from "../player/Player";
import { TWO_PI } from "../../utils/common";
import { MobType } from "../../../shared/enum";

export function MobHealthRegen<T extends new (...args: any[]) => BaseMob>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.starfishRegeningHealth || (this.type === MobType.STARFISH && this.health < this.maxHealth / 2)) {
                this.starfishRegeningHealth = true;
                // Hmm maybe i shouldnt use size here
                const starfishRegenMultiplier = 10 * this.size;
                this.health = Math.min(this.maxHealth + 1, this.health + starfishRegenMultiplier);
                if (this.health > this.maxHealth) {
                    this.starfishRegeningHealth = false;
                    return;
                }
                // Running away from target
                if (this.mobTargetEntity) {
                    const dx = this.mobTargetEntity.x - this.x;
                    const dy = this.mobTargetEntity.y - this.y;

                    const targetAngle = ((Math.atan2(dy, dx) / TWO_PI) * 255 + 255) % 255;

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
            }
        }

        free() {
            if (super["free"]) {
                super["free"]();
            }
        }
    };
}