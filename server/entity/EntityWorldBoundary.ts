import { Entity, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { WavePool } from "../wave/WavePool";
import { isPetal, removeAllBindings } from "../utils/common";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { MobType } from "../../shared/enum";

export const SAFETY_DISTANCE = 300;

export const PROJECTILE_TYPES: Set<MobType> = new Set([]);

export function EntityWorldBoundary<T extends new (...args: any[]) => Entity>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this instanceof Mob) {
                if (isPetal(this.type)) {
                    return;
                }

                // Mob like missile will ignore border
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

            const waveMapSize = poolThis.waveData.waveMapSize;
            
            const worldRadius = waveMapSize - getRadius();

            const dx = this.x - waveMapSize;
            const dy = this.y - waveMapSize;

            if (Math.sqrt(dx * dx + dy * dy) > worldRadius) {
                const collisionAngle = Math.atan2(dy, dx);
                const knockback = this instanceof Mob ? 0 : 15;

                this.x = waveMapSize + Math.cos(collisionAngle) * (worldRadius - knockback);
                this.y = waveMapSize + Math.sin(collisionAngle) * (worldRadius - knockback);
            }
        }

        free() {
            if (super["free"]) {
                super["free"]();
            }
        }
    };
}