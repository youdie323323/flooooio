import { WavePool } from "../../Genres/Wave/WavePool";
import { angleToRad } from "../../Utils/common";
import { EntityMixinConstructor, Entity, EntityMixinTemplate, onUpdateTick } from "./Entity";

export function EntityLinearMovement<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            if (this.magnitude > 0) {
                const rad = angleToRad(this.angle);
                const magnitude = this.magnitude / 255;
                this.x += Math.cos(rad) * magnitude;
                this.y += Math.sin(rad) * magnitude;
            }
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}