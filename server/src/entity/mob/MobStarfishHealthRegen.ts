import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob, Mob, MobInstance } from "./Mob";
import { Player, PlayerInstance } from "../player/Player";
import { isPetal } from "../../utils/common";
import { MobType } from "../../../../shared/enum";
import { turnAngleToTarget } from "./MobAggressivePursuit";

export function MobStarfishHealthRegen<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Dont check when this is petal
            if (isPetal(this.type)) return;

            if (
                this.starfishRegeningHealth ||
                (
                    this.type === MobType.STARFISH &&
                    // Run if hp is less than half
                    this.health < this.maxHealth / 2
                )
            ) {
                this.starfishRegeningHealth = true;

                // Hmm maybe i shouldnt use size here
                this.health = Math.min(this.maxHealth + 1, this.health + (5 * this.size));
                if (this.health > this.maxHealth) {
                    this.starfishRegeningHealth = false;
                    return;
                }

                // Running away from target
                if (this.mobTargetEntity) {
                    const dx = this.mobTargetEntity.x - this.x;
                    const dy = this.mobTargetEntity.y - this.y;

                    this.angle = turnAngleToTarget(
                        this.angle,
                        // Reverse angle
                        -dx,
                        -dy,
                    );

                    this.magnitude = 255 * Mob.BASE_SPEED;
                }
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}