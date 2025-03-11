import { MOB_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import { WavePool } from "../../../Genres/Wave/WavePool";
import { isPetal } from "../../../Utils/common";
import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { BaseMob } from "./Mob";

const TAU = Math.PI * 2;

export function MobBodyConnection<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

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
            const centiDistance = (collision.rx + collision.ry) * (this.size / collision.fraction);

            const currentDistance = Math.hypot(dx, dy);

            if (currentDistance > centiDistance) {
                this.magnitude = 0;
                this.angle = ((Math.atan2(dy, dx) / TAU) * 255 + 255) % 255;

                const ratio = (currentDistance - centiDistance) / currentDistance;
                this.x += dx * ratio;
                this.y += dy * ratio;
            }
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}