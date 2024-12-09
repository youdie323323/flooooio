import { isPetal } from "../../utils/common";
import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob } from "./Mob";
import { MOB_PROFILES } from "../../../../shared/entity/mob/mobProfiles";

const TAU = Math.PI * 2;

export function MobBodyConnection<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

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

            const profile = MOB_PROFILES[this.type];

            // Arc
            const centiDistance = (profile.rx + profile.ry) * (this.size / profile.fraction);

            const currentDistance = Math.hypot(dx, dy);

            if (currentDistance > centiDistance) {
                this.magnitude = 0;
                this.angle = ((Math.atan2(dy, dx) / TAU) * 255 + 255) % 255;

                const ratio = (currentDistance - centiDistance) / currentDistance;
                this.x += dx * ratio;
                this.y += dy * ratio;
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }

            this.connectingSegment = null;
        }
    };
}