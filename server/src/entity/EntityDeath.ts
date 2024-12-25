import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { WavePool } from "../wave/WavePool";
import { isEntityDead, isPetal, removeAllBindings } from "../utils/common";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";

export function EntityDeath<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (
                !isEntityDead(poolThis, this) &&
                0 >= this.health
            ) {
                if (this instanceof Player) {
                    this.isDead = true;

                    this.health = 0;

                    // Stop moving
                    this.magnitude = 0;

                    removeAllBindings(poolThis, this.id);

                    return;
                }

                if (this instanceof Mob) {
                    poolThis.removeMob(this.id);

                    return;
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