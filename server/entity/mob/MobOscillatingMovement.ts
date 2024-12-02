import { getCentiFirstSegment, isCentiBody, isPetal, TWO_PI } from "../../utils/common";
import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob } from "./Mob";
import { SHARED_SINE_WAVE } from "../../utils/cosineWave";
import { getRandomAngle } from "../../utils/random";
import { MobType } from "../../../shared/enum";
import { MOB_BEHAVIORS, MobBehaviors } from "./MobAggressivePursuit";

const MOVEMENT_DURATION = 1 / 150;

export function MobOscillatingMovement<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        private sineWaveIndex: number = -1;
        private movementTimer: number = 0;
        private rotationCounter: number = 0;
        private isMoving: boolean = false;

        startMovement() {
            if (!this.isMoving) {
                this.isMoving = true;
                this.movementTimer = 0;
            }
        }

        [onUpdateTick](poolThis: WavePool): void {
            // Call parent onUpdateTick
            // to use multiple mixin functions
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (isPetal(this.type)) return;

            // If centi, dont do anything when this is centi body
            if (isCentiBody(poolThis, this)) return;

            // Follows the player when the player moves away from this (pet) for a certain distance
            // Dont follows if targetting other mob
            if (this.petMaster && !this.mobTargetEntity) {
                const dx = this.petMaster.x - this.x;
                const dy = this.petMaster.y - this.y;
                const distanceToParent = Math.hypot(dx, dy);

                if (distanceToParent > 2 * this.size) {
                    const targetAngle = ((Math.atan2(dy, dx) / TWO_PI) * 255 + 255) % 255;

                    let currentAngle = this.angle;
                    while (currentAngle < 0) currentAngle += 255;
                    currentAngle = currentAngle % 255;

                    let angleDiff = targetAngle - currentAngle;
                    if (angleDiff > 127.5) angleDiff -= 255;
                    if (angleDiff < -127.5) angleDiff += 255;

                    this.angle += angleDiff * 0.1;
                    this.angle = ((this.angle + 255) % 255);

                    this.magnitude = 255 * 4;

                    this.petGoingToMaster = true;
                } else {
                    this.petGoingToMaster = false;
                }
            } else {
                this.petGoingToMaster = false;
            }

            // Dont move when passive
            if (MOB_BEHAVIORS[this.type] !== MobBehaviors.PASSIVE && !this.petGoingToMaster) {
                if (this.shouldApplyAngleShake()) {
                    this.angle += SHARED_SINE_WAVE.get(++this.sineWaveIndex) * (this.mobTargetEntity ? 2 : 1);
                }

                // Do defensive-position move if not targetting player
                if (!this.mobTargetEntity) {
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

        free = () => {
            if (super.free) {
                super.free();
            }
        }
    };
}