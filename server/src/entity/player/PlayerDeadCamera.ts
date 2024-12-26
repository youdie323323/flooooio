import { EntityMixinConstructor, EntityMixinTemplate, MaybeDisposable, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BasePlayer } from "./Player";
import { findNearestEntity } from "../mob/MobAggressivePursuit";
import { isEntityDead } from "../../utils/common";

export function PlayerDeadCamera<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly SWITCH_AFTER_MS = 500;

        private isExecuting: boolean = false;
        private executionTimeout: NodeJS.Timeout;

        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.isDead) {
                // Determine if should find dead camera entity
                const isFindable: boolean =
                    // Theres no deadCameraTargetEntity
                    !this.deadCameraTargetEntity ||
                    // Camera target dead
                    isEntityDead(poolThis, this.deadCameraTargetEntity);

                if (isFindable) {
                    if (!this.isExecuting) {
                        this.isExecuting = true;

                        // Camera entity dead, find next entity
                        this.executionTimeout = setTimeout(() => {
                            this.isExecuting = false;

                            // Dont change camera if player is not dead
                            if (!this.isDead) return;

                            // Ygg is the highest priority
                            const cameraEntity = findNearestEntity(this, [
                                poolThis.getAllMobs().filter(m => !m.petalMaster && !m.petMaster),
                                poolThis.getAllClients().filter(c => !c.isDead && c.id !== this.id),
                            ].flat());
                            if (cameraEntity) {
                                this.deadCameraTargetEntity = cameraEntity;
                            } else {
                                this.deadCameraTargetEntity = null;
                            }
                        }, MixedBase.SWITCH_AFTER_MS);
                    }
                } else {
                    this.x = this.deadCameraTargetEntity.x;
                    this.y = this.deadCameraTargetEntity.y;
                }
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }

            clearTimeout(this.executionTimeout);
            this.executionTimeout = null;

            this.deadCameraTargetEntity = null;
        }
    };
}