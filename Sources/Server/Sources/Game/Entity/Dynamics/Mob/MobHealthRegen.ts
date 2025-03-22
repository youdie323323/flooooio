import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import { MobType } from "../../../../../../Shared/Entity/Statics/EntityType";
import type { WavePool } from "../../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, EntityMixinTemplate} from "../Entity";
import { ON_UPDATE_TICK } from "../Entity";
import { calculateMaxHealth } from "../EntityElimination";
import type { BaseMob } from "./Mob";
import { turnAngleToTarget } from "./MobAggressivePursuit";

export function MobHealthRegen<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [ON_UPDATE_TICK](poolThis: WavePool): void {
            super[ON_UPDATE_TICK](poolThis);

            // Dont check if this is petal
            if (isPetal(this.type)) return;

            // Regen for starfish
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

                // TODO: dont use size to regen (maybe, rarity?)
                const healAmount = (3 * this.size) / maxHealth;

                this.health = Math.min(1, this.health + healAmount);
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

                    this.magnitude = 255 * this.speed;
                }
            }
        }
    };
}