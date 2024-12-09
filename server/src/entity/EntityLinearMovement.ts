import { angleToRad } from "../utils/common";
import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { WavePool } from "../wave/WavePool";

export function EntityLinearMovement<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.magnitude > 0) {
                const rad = angleToRad(this.angle);
                const magnitude = this.magnitude / 255;
                this.x += Math.cos(rad) * magnitude;
                this.y += Math.sin(rad) * magnitude;
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}