import { EntityMixinConstructor, EntityMixinTemplate, MaybeFreeable, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BasePlayer } from "./Player";
import { findNearestEntity } from "../mob/MobAggressivePursuit";

export function PlayerDeadCamera<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        private isExecuting: boolean = false;
        private executionTimeout: NodeJS.Timeout;

        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.isDead) {
                const isFindable: boolean =
                    !this.deadCameraTargetEntity ||
                    !(poolThis.getMob(this.deadCameraTargetEntity.id) || poolThis.getClient(this.deadCameraTargetEntity.id));

                if (isFindable) {
                    if (!this.isExecuting) {
                        this.isExecuting = true;

                        // Camera entity dead, find next entity
                        this.executionTimeout = setTimeout(() => {
                            this.isExecuting = false;

                            // Dont change camera if player is not dead
                            if (!this.isDead && !poolThis) {
                                return;
                            }

                            // Ygg is the highest priority
                            const cameraEntity = findNearestEntity(this, [
                                poolThis.getAllMobs().filter(m => !m.petalMaster && !m.petMaster),
                                poolThis.getAllClients().filter(c => !c.isDead && c.id !== this.id),
                            ].flat());
                            if (!cameraEntity) {
                                this.deadCameraTargetEntity = null;
                            } else {
                                this.deadCameraTargetEntity = cameraEntity;
                            }
                        }, 1000);
                    }
                } else {
                    this.x = this.deadCameraTargetEntity.x;
                    this.y = this.deadCameraTargetEntity.y;
                }
            }
        }

        free = () => {
            if (super.free) {
                super.free();
            }

            clearTimeout(this.executionTimeout);
        }
    };
}