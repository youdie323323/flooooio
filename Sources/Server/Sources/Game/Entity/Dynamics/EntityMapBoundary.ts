import { MobType, PetalType } from "../../../../../Shared/Entity/Statics/EntityType";
import { MOB_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import { PETAL_PROFILES } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import { WavePool } from "../../Genres/Wave/WavePool";
import { isPetal } from "../../Utils/common";
import { EntityMixinConstructor, Entity, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { Mob } from "./Mob/Mob";
import { Player } from "./Player/Player";

export const SAFETY_DISTANCE = 300;

export const PROJECTILE_TYPES: Set<MobType | PetalType> = new Set([]);

export function EntityMapBoundary<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

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

            if (this instanceof Player) {
                // Dont if uncollidable
                if (!this.isCollidable) {
                    return;
                }
            }

            const getRadius = () => {
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
            };

            const { mapRadius } = poolThis.waveData;

            const worldRadius = mapRadius - getRadius();

            const dx = this.x - mapRadius;
            const dy = this.y - mapRadius;

            if (Math.sqrt(dx * dx + dy * dy) > worldRadius) {
                const collisionAngle = Math.atan2(dy, dx);
                const knockback = this instanceof Mob ? 0 : 15;

                this.x = mapRadius + Math.cos(collisionAngle) * (worldRadius - knockback);
                this.y = mapRadius + Math.sin(collisionAngle) * (worldRadius - knockback);
            }
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}