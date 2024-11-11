import { Entity, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";
import { angleToRad, isPetal, onClientDeath } from "./common/common";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { USAGE_RELOAD_PETALS } from "./player/PlayerReload";

export let mapRadius = 2500;

export const mapCenterX = 4470;
export const mapCenterY = 4470;
export const safetyDistance = 300;

export function EntityChecksum<T extends new (...args: any[]) => Entity>(Base: T) {
    return class extends Base {
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
                    onClientDeath(poolThis, this);
                }
                if (this instanceof Mob) {
                    poolThis.removeMob(this.id);
                }
            }

            if (this instanceof Player && !this.isDead) {
                this.slots.surface.forEach((e, i) => {
                    // Angle correction petals like egg
                    if (e != null && poolThis.getMob(e.id) && USAGE_RELOAD_PETALS.has(e.type)) {
                        e.angle = 0;
                    }
                });
            }

            // In the current version of florr.io, the pet goes to the player's position after a certain range away from the target
            // But in the florr.io wave, what is specification?
            if (this instanceof Mob && this.petParentPlayer && /* This condition do old florr (maybe) */ !this.mobTargetEntity) {
                const dx = this.petParentPlayer.x - this.x;
                const dy = this.petParentPlayer.y - this.y;
                const distanceToParent = Math.hypot(dx, dy);

                if (this.petGoingToPlayer || distanceToParent > 5 * this.size) {
                    this.mobTargetEntity = null;
                    if (distanceToParent < this.size) {
                        this.petGoingToPlayer = false;
                    } else {
                        this.petGoingToPlayer = true;
                    }

                    const targetAngle = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 255 + 255) % 255;

                    let currentAngle = this.angle;
                    while (currentAngle < 0) currentAngle += 255;
                    currentAngle = currentAngle % 255;

                    let angleDiff = targetAngle - currentAngle;
                    if (angleDiff > 127.5) angleDiff -= 255;
                    if (angleDiff < -127.5) angleDiff += 255;

                    this.angle += angleDiff * 0.1;
                    this.angle = ((this.angle + 255) % 255);

                    this.magnitude = 255 * 4;
                }
            }

            // World boundary (circular)
            if (!(this instanceof Mob && isPetal(this.type))) {
                // TODO: fix gap
                const worldRadius = Math.min(mapCenterX, mapCenterY) - mapRadius - (this instanceof Mob ? getRadius() - /* Decrease some gaps */ 15 : 0);

                const dx = this.x - mapCenterX;
                const dy = this.y - mapCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > worldRadius) {
                    const collisionAngle = Math.atan2(dy, dx);

                    this.x = mapCenterX + Math.cos(collisionAngle) * (worldRadius - 20);
                    this.y = mapCenterY + Math.sin(collisionAngle) * (worldRadius - 20);
                }
            }
        }
    };
}