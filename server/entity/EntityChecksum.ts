import { Entity, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";
import { isPetal, removeAllBindings, TWO_PI } from "./utils/common";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { USAGE_RELOAD_PETALS } from "./player/PlayerReload";
import { isLivingPetal } from "./mob/petal/Petal";
import { MobType } from "../../shared/types";

export let mapRadius = 2500;

export const mapCenterX = 4470;
export const mapCenterY = 4470;
export const safetyDistance = 300;

export const PROJECTILE_TYPES: Set<MobType> = new Set([
]);

export function EntityChecksum<T extends new (...args: any[]) => Entity>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
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

            if (this.health < 0) {
                // !this.isDead will prevent call every fps
                if (this instanceof Player && !this.isDead) {
                    removeAllBindings(poolThis, this);

                    this.isDead = true;
                    // Stop moving
                    this.magnitude = 0;
                }
                if (this instanceof Mob) {
                    poolThis.removeMob(this.id);
                }
            }

            if (this instanceof Player && !this.isDead) {
                this.slots.surface.forEach((e, i) => {
                    // Angle correction petals like egg
                    if (e != null && isLivingPetal(e) && poolThis.getMob(e.id) && USAGE_RELOAD_PETALS.has(e.type)) {
                        e.angle = 0;
                    }
                });
            }

            // Follows the player when the player moves away from this (pet) for a certain distance
            // Dont follows if targetting other mob
            if (this instanceof Mob && this.petParentPlayer) {
                if (!this.mobTargetEntity) {
                    const dx = this.petParentPlayer.x - this.x;
                    const dy = this.petParentPlayer.y - this.y;
                    const distanceToParent = Math.hypot(dx, dy);

                    if (distanceToParent > 2 * this.size) {
                        const targetAngle = ((Math.atan2(dy, dx) / TWO_PI) * 255 + 255) % 255;

                        let currentAngle = this.angle;
                        while (currentAngle < 0) currentAngle += 255;
                        currentAngle = currentAngle % 255;

                        let angleDiff = targetAngle - currentAngle;
                        if (angleDiff > 127.5) angleDiff -= 255;
                        if (angleDiff < -127.5) angleDiff += 255;

                        this.angle += angleDiff * 0.1;
                        this.angle = ((this.angle + 255) % 255);

                        this.magnitude = 255 * 4;

                        this.petGoingToPlayer = true;
                    } else {
                        this.petGoingToPlayer = false;
                    }
                } else {
                    this.petGoingToPlayer = false;
                }
            }

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

                // World boundary (circular)
                const worldRadius = Math.min(mapCenterX, mapCenterY) - mapRadius - (this instanceof Mob ? getRadius() - /* Decrease some gaps */ 15 : 0);

                const dx = this.x - mapCenterX;
                const dy = this.y - mapCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > worldRadius) {
                    const collisionAngle = Math.atan2(dy, dx);
                    const knockback = this instanceof Mob ? 0 : 20;

                    this.x = mapCenterX + Math.cos(collisionAngle) * (worldRadius - knockback);
                    this.y = mapCenterY + Math.sin(collisionAngle) * (worldRadius - knockback);
                }
            }
        }
    };
}