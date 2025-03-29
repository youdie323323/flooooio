import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import type { WavePool } from "../../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, EntityMixinTemplate } from "../Entity";
import { ON_UPDATE_TICK } from "../Entity";
import type { BaseMob, MobInstance } from "./Mob";
import MOB_PROFILES from "../../../../../../Shared/Native/mob_profiles.json";

const TAU = Math.PI * 2;

/**
 * Get first segment (head) of mob.
 */
export const traverseMobSegments = (poolThis: WavePool, mob: MobInstance): MobInstance => {
    // Walk through segments
    const { connectingSegment } = mob;

    if (connectingSegment && poolThis.getMob(connectingSegment.id)) {
        return traverseMobSegments(poolThis, connectingSegment);
    }

    return mob;
};

/**
 * Determine if mob is segment of body.
 */
export const isBody = (poolThis: WavePool, mob: MobInstance): boolean => traverseMobSegments(poolThis, mob) !== mob;

export function MobBodyConnection<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [ON_UPDATE_TICK](poolThis: WavePool): void {
            super[ON_UPDATE_TICK](poolThis);

            // Dont connect when this is petal
            if (isPetal(this.type)) return;

            // If not body, return
            if (!this.connectingSegment) return;

            // If connected segment dead, divide body
            if (!poolThis.getMob(this.connectingSegment.id)) {
                this.connectingSegment = null;

                return;
            }

            const dx = this.connectingSegment.x - this.x;
            const dy = this.connectingSegment.y - this.y;

            const { collision } = MOB_PROFILES[this.type];

            // Arc
            const segmentDistance = (collision.radius * 2) * (this.size / collision.fraction);

            const currentDistance = Math.hypot(dx, dy);

            if (currentDistance > segmentDistance) {
                this.magnitude = 0;
                this.angle = ((Math.atan2(dy, dx) / TAU) * 255 + 255) % 255;

                const ratio = (currentDistance - segmentDistance) / currentDistance;
                this.x += dx * ratio;
                this.y += dy * ratio;
            }
        }
    };
}