import { traverseMobSegment, isPetal, isBody } from "../../utils/common";
import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BaseMob, Mob } from "./Mob";
import { SHARED_SINE_WAVE } from "../../utils/cosineWave";
import { getRandomAngle } from "../../utils/random";
import { MOB_BEHAVIORS, MobBehaviors, turnAngleToTarget } from "./MobAggressivePursuit";
import { MobType } from "../../../../shared/enum";
import { memoize, memoizeGetter } from "../../../../shared/utils/memoize";

const TAU = Math.PI * 2;

const MOVEMENT_DURATION = 1 / 150;

export function MobDynamicMovement<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        private sineWaveIndex: number = 0;
        private movementTimer: number = 0;
        private rotationCounter: number = 0;
        private isMoving: boolean = false;

        private startMovement() {
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

            // If body, dont do anything
            if (isBody(poolThis, this)) return;

            // Follows the player when the player moves away from this (pet) for a certain distance
            // Dont follows if targetting other mob
            if (this.petMaster && !this.mobTargetEntity) {
                const dx = this.petMaster.x - this.x;
                const dy = this.petMaster.y - this.y;
                const distanceToParent = Math.hypot(dx, dy);

                if (distanceToParent > 2 * this.size) {
                    this.angle = turnAngleToTarget(
                        this.angle,
                        dx,
                        dy,
                    );

                    this.magnitude = 255 * Mob.BASE_SPEED;

                    this.petGoingToMaster = true;
                } else {
                    this.petGoingToMaster = false;
                }
            } else {
                this.petGoingToMaster = false;
            }

            if (
                // Dont move when passive
                MOB_BEHAVIORS[this.type] !== MobBehaviors.PASSIVE &&
                !this.petGoingToMaster
            ) {
                if (this.shouldShakeAngle) {
                    this.angle += SHARED_SINE_WAVE.get(this.sineWaveIndex++) * (this.mobTargetEntity ? 2 : 1);
                }

                // Do defensive-position move if not targetting player
                if (!this.mobTargetEntity) {
                    if (this.rotationCounter++ >= 200) {
                        this.angle = getRandomAngle();
                        this.rotationCounter = 0;
                    }

                    if (this.isMoving) {
                        if (this.movementTimer >= 1) {
                            this.magnitude = 0;
                            this.isMoving = false;
                        } else {
                            // TODO: ease move
                            // TODO: centi always moving without stop
                            this.magnitude = 255 * (this.movementTimer * 2);
                            this.movementTimer += MOVEMENT_DURATION;
                        }
                    } else this.startMovement();
                } else {
                    this.isMoving = false;
                }
            }
        }

        private get shouldShakeAngle(): boolean {
            // Shake angle if bee, or hornet
            return this.type === MobType.BEE;
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}