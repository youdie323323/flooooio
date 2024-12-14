import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { WavePool } from "../wave/WavePool";
import { isPetal, removeAllBindings } from "../utils/common";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";
import { MobType, PetalType } from "../../../shared/EntityType";
import { PETAL_PROFILES } from "../../../shared/entity/mob/petal/petalProfiles";
import { MOB_PROFILES } from "../../../shared/entity/mob/mobProfiles";

export const SAFETY_DISTANCE = 300;

export const PROJECTILE_TYPES: Set<MobType | PetalType> = new Set([]);

export function EntityMapBoundary<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this instanceof Mob) {
                // Dont if petal
                if (isPetal(this.type)) {
                    return;
                }

                // Projectiles ignore border
                if (!isPetal(this.type) && PROJECTILE_TYPES.has(this.type)) {
                    return;
                }
            }

            const getRadius = () => {
                if (this instanceof Player) {
                    return this.size;
                } else if (this instanceof Mob) {
                    const profile = MOB_PROFILES[this.type] || PETAL_PROFILES[this.type];
                    return Math.max(
                        profile.rx * (this.size / profile.fraction),
                        profile.ry * (this.size / profile.fraction)
                    );
                }
                return 0;
            };

            const waveMapRadius = poolThis.waveData.waveMapRadius;
            
            const worldRadius = waveMapRadius - getRadius();

            const dx = this.x - waveMapRadius;
            const dy = this.y - waveMapRadius;

            if (Math.sqrt(dx * dx + dy * dy) > worldRadius) {
                const collisionAngle = Math.atan2(dy, dx);
                const knockback = this instanceof Mob ? 0 : 15;

                this.x = waveMapRadius + Math.cos(collisionAngle) * (worldRadius - knockback);
                this.y = waveMapRadius + Math.sin(collisionAngle) * (worldRadius - knockback);
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}