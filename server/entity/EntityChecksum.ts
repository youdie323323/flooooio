import { Entity, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";
import { angleToRad, isPetal, onPlayerDead } from "./utils/small";
import { Mob } from "./mob/Mob";
import { Player } from "./player/Player";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";

export let mapRadius = 2500;

export const mapCenterX = 4470;
export const mapCenterY = 4470;
export const safetyDistance = 50;

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

            // Dont reload if player is dead
            if (this instanceof Player && !this.isDead) {
                // Respawn petal if destroyed
                this.slots.surface.forEach((e, i) => {
                    // If e is not falsy and dont has e on mob pool, that means petal are breaked
                    // So if petal is breaked, start reloading
                    if (e != null && !poolThis.mobs.has(e.id)) {
                        if (this.slots.cooldowns[i] === 0) {
                            const profile = PETAL_PROFILES[e.type];
                            this.slots.cooldowns[i] = Date.now() + (profile[e.rarity].petalReload * 1000);
                        }
                        // If cooldown elapsed
                        else if (Date.now() >= this.slots.cooldowns[i]) {
                            this.slots.surface[i] = poolThis.addPetalOrMob(
                                e.type,
                                e.rarity,
                                // Make it player coordinate so its looks like spawning from players body
                                this.x,
                                this.y
                            );
                            this.slots.cooldowns[i] = 0;
                        }
                    }
                });
            }

            if (this.health < 0) {
                // !this.isDead will prevent call every fps
                if (this instanceof Player && !this.isDead) {
                    onPlayerDead(poolThis, this, false);
                }
                if (this instanceof Mob) {
                    poolThis.removeMob(this.id);
                }
            }

            // World boundary (circular)
            if (!(this instanceof Mob && isPetal(this.type))) {
                const worldRadius = Math.min(mapCenterX, mapCenterY) - mapRadius - (this instanceof Mob ? getRadius() : 0);

                const dx = this.x - mapCenterX;
                const dy = this.y - mapCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > worldRadius) {
                    const collisionAngle = Math.atan2(dy, dx);

                    if (this instanceof Mob && !this.targetPlayer) {
                        const reflectedAngleRad = 2 * collisionAngle - angleToRad(this.angle) + Math.PI;

                        this.angle = ((reflectedAngleRad / (2 * Math.PI)) * 255) % 255;
                        if (this.angle < 0) {
                            this.angle += 256;
                        }
                    }

                    this.x = mapCenterX + Math.cos(collisionAngle) * worldRadius;
                    this.y = mapCenterY + Math.sin(collisionAngle) * worldRadius;
                }
            }
        }
    };
}