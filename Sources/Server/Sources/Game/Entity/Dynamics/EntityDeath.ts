import { WavePool } from "../../Genres/Wave/WavePool";
import { isDeadEntity, removeAllBindings } from "../../Utils/common";
import { EntityMixinConstructor, Entity, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { Mob } from "./Mob/Mob";
import { Player } from "./Player/Player";

export function EntityDeath<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            if (
                !isDeadEntity(poolThis, this) &&
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

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}