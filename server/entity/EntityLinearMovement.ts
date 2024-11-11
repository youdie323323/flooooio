import { angleToRad } from "./common/common";
import { Entity, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";

export function EntityLinearMovement<T extends new (...args: any[]) => Entity>(Base: T) {
    return class extends Base {
        [onUpdateTick](poolThis: EntityPool): void {
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
    };
}