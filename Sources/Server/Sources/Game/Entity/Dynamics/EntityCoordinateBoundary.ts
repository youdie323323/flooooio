import { isPetal } from "../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import type { MobType, PetalType } from "../../../../../Shared/Entity/Statics/EntityType";
import { MOB_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import { PETAL_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import type { WavePool } from "../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, Entity, EntityMixinTemplate} from "./Entity";
import { onUpdateTick } from "./Entity";
import { Mob } from "./Mob/Mob";
import { Player } from "./Player/Player";

export const SAFETY_DISTANCE = 300;

export const PROJECTILE_TYPES: Set<MobType | PetalType> = new Set([]);

export function EntityCoordinateBoundary<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            if (this instanceof Mob) {
                const thisIsPetal = isPetal(this.type);

                // Return if petal
                if (thisIsPetal) {
                    return;
                }

                // Projectiles ignore border
                if (!thisIsPetal && PROJECTILE_TYPES.has(this.type)) {
                    return;
                }
            }

            if (this instanceof Player) {
                // Dont if uncollidable
                if (!this.isCollidable) {
                    return;
                }
            }

            const { mapRadius } = poolThis.waveData;

            const worldRadius = mapRadius - this.getRadius();

            const dx = this.x - mapRadius;
            const dy = this.y - mapRadius;

            if (Math.sqrt(dx * dx + dy * dy) > worldRadius) {
                const collisionAngle = Math.atan2(dy, dx);
                const knockback = this instanceof Mob ? 0 : 15;

                this.x = mapRadius + Math.cos(collisionAngle) * (worldRadius - knockback);
                this.y = mapRadius + Math.sin(collisionAngle) * (worldRadius - knockback);
            }
        }

        private getRadius(): number {
            if (this instanceof Player) {
                return this.size;
            } else if (this instanceof Mob) {
                const { collision } = MOB_PROFILES[this.type] || PETAL_PROFILES[this.type];

                return Math.max(
                    collision.rx * (this.size / collision.fraction),
                    collision.ry * (this.size / collision.fraction),
                );
            }

            return 0;
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}