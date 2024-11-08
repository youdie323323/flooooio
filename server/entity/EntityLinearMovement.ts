import { angleToRad } from "./utils/common";
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
                this.x += Math.cos(rad) * (this.magnitude / 255);
                this.y += Math.sin(rad) * (this.magnitude / 255);
            }
        }
    };
}