import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob, Mob, MobData, MobInstance } from "./Mob";
import { Player, PlayerInstance } from "../player/Player";
import { calculateMaxHealth, isPetal } from "../../utils/common";
import { MobType } from "../../../../shared/EntityType";
import { turnAngleToTarget } from "./MobAggressivePursuit";
import { MOB_PROFILES } from "../../../../shared/entity/mob/mobProfiles";

export function MobHealthRegen<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
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
                    // Regen if hp is less than half
                    this.health < 0.5
                )
            ) {
                this.starfishRegeningHealth = true;

                const maxHealth = calculateMaxHealth(this);

                // Hmm maybe i shouldnt use size here
                const healHp = (5 * this.size) / maxHealth;

                this.health = Math.min(1, this.health + healHp);
                if (this.health >= 1) {
                    this.starfishRegeningHealth = false;
                    return;
                }

                // Running away from target
                if (this.targetEntity) {
                    const dx = this.targetEntity.x - this.x;
                    const dy = this.targetEntity.y - this.y;

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