import { isPetal, isBody } from "../../../Utils/common";
import { getRandomAngle } from "../../../Utils/random";
import SinusodialWave from "./MobSpecialMovementSinusodialWave";
import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { EGG_TYPE_MAPPING } from "../Player/PlayerPetalReload";
import { BaseMob } from "./Mob";
import { MOB_BEHAVIORS, MobBehavior, turnAngleToTarget } from "./MobAggressivePursuit";
import { MobType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { WavePool } from "../../../Genres/Wave/WavePool";

const MOVEMENT_DURATION = 1 / 150;

export function MobSpecialMovement<T extends EntityMixinConstructor<BaseMob>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        private sineWaveIndex: number = 0;
        private movementTimer: number = 0;
        private rotationCounter: number = 0;
        private isMoving: boolean = false;

        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            // Dont dynamic move when petal
            if (isPetal(this.type)) {
                // Egg petals always up direction
                if (EGG_TYPE_MAPPING[this.type]) {
                    this.angle = 0;
                }

                return;
            }

            // Dont dynamic move when passive
            if (MOB_BEHAVIORS[this.type] === MobBehavior.Passive) return;

            // If body, dont do anything
            if (isBody(poolThis, this)) return;

            // Follows the player when the player moves away from this (pet) for a certain distance
            // Dont follows if targetting other mob
            if (this.petMaster && !this.targetEntity) {
                const dx = this.petMaster.x - this.x;
                const dy = this.petMaster.y - this.y;
                const distanceToParent = Math.hypot(dx, dy);

                if (distanceToParent > 2 * this.size) {
                    this.angle = turnAngleToTarget(
                        this.angle,
                        dx,
                        dy,
                    );

                    this.magnitude = 255 * this.speed;

                    this.petGoingToMaster = true;
                } else {
                    this.petGoingToMaster = false;
                }
            } else {
                this.petGoingToMaster = false;
            }

            if (
                !this.petGoingToMaster
            ) {
                if (this.shouldShakeAngle) {
                    this.angle += SinusodialWave.at(this.sineWaveIndex++) * (this.targetEntity ? 2 : 1);
                }

                // Do dynamic move if not targetting player
                if (!this.targetEntity) {
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

        private startMovement() {
            if (!this.isMoving) {
                this.isMoving = true;
                this.movementTimer = 0;
            }
        }

        private get shouldShakeAngle(): boolean {
            // Shake angle if bee, or hornet
            return this.type === MobType.Bee;
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}