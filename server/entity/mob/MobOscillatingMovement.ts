import { MobType } from "../../../shared/types";
import { getRandomAngle, isPetal } from "../utils/small";
import { onUpdateTick } from "../Entity";
import { EntityPool } from "../EntityPool";
import { BaseMob } from "./Mob";
import { SHARED_SINE_WAVE } from "../utils/cosineWave";

const MOVEMENT_DURATION = 1 / 150;

export function MobOscillatingMovement<T extends new (...args: any[]) => BaseMob>(Base: T) {
    return class extends Base {
        private beeSineWaveIndex: number = -1;
        private movementTimer: number = 0;
        private rotationCounter: number = 0;
        private isMoving: boolean = false;

        startMovement() {
            if (!this.isMoving) {
                this.isMoving = true;
                this.movementTimer = 0;
            }
        }

        [onUpdateTick](poolThis: EntityPool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Dont move when this is petal or pet
            if (!isPetal(this.type) && this.type !== MobType.BUBBLE) {
                if (this.shouldApplyAngleShake()) {
                    this.angle += SHARED_SINE_WAVE.get(++this.beeSineWaveIndex) * (this.targetEntity ? 3 : 1);
                }

                // Do defensive-position move if not targetting player
                if (!this.targetEntity) {
                    if (this.petGoingToPlayer) {
                        return;
                    }

                    if (this.rotationCounter++ >= 200) {
                        this.angle = getRandomAngle();
                        this.rotationCounter = 0;
                    }

                    if (!this.isMoving) {
                        this.startMovement();
                    } else {
                        if (this.movementTimer >= 1) {
                            this.magnitude = 0;
                            this.isMoving = false;
                        } else {
                            // TODO: ease move
                            this.magnitude = 255 * (this.movementTimer * 2);
                            this.movementTimer += MOVEMENT_DURATION;
                        }
                    }
                } else {
                    this.isMoving = false;
                }
            }
        }

        private shouldApplyAngleShake(): boolean {
            return this.type === MobType.BEE;
        }
    };
}