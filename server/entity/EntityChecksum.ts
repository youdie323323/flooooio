import { Entity, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";
import { isPetal, removeAllBindings } from "../utils/common";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { MobType, PetalType } from "../../shared/types";

export const MAP_CENTER_X = 5000;
export const MAP_CENTER_Y = 5000;

export const SAFETY_DISTANCE = 300;

export const PROJECTILE_TYPES: Set<MobType> = new Set([]);

export function EntityChecksum<T extends new (...args: any[]) => Entity>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Hp check
            {
                if (this.health <= 0) {
                    if (this instanceof Player && !this.isDead) {
                        this.isDead = true;
                        // Stop moving
                        this.magnitude = 0;

                        removeAllBindings(poolThis, this);
                    }
                    if (this instanceof Mob) {
                        poolThis.removeMob(this.id);
                    }
                }
            }

            // Make eggs angle anchored
            {
                if (this instanceof Mob && isPetal(this.type) && this.type === PetalType.BEETLE_EGG) {
                    this.angle = 0;
                }
            }

            // World boundary (circular)
            {
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

                const worldRadius = poolThis.waveData.mapSize - getRadius();

                const dx = this.x - MAP_CENTER_X;
                const dy = this.y - MAP_CENTER_Y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > worldRadius) {
                    const collisionAngle = Math.atan2(dy, dx);
                    const knockback = this instanceof Mob ? 0 : 15;

                    this.x = MAP_CENTER_X + Math.cos(collisionAngle) * (worldRadius - knockback);
                    this.y = MAP_CENTER_Y + Math.sin(collisionAngle) * (worldRadius - knockback);
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