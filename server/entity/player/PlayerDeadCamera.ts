import { EntityMixinTemplate, onUpdateTick } from "../Entity";
import { EntityPool, UPDATE_FPS } from "../EntityPool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { MobType, PetalType } from "../../../shared/types";
import { isSpawnableSlot, PetalData, PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { MoodKind } from "../../../shared/mood";
import { isPetal, TWO_PI } from "../../utils/common";
import { findNearestEntity } from "../mob/MobAggressivePursuit";

export function PlayerDeadCamera<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        private isExecuting: boolean = false;
        private executionTimeout: NodeJS.Timeout;

        [onUpdateTick](poolThis: EntityPool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.isDead) {
                const isFindable: boolean =
                    !this.playerCameraTargetEntity ||
                    !(poolThis.getMob(this.playerCameraTargetEntity.id) || poolThis.getClient(this.playerCameraTargetEntity.id));

                if (isFindable) {
                    if (!this.isExecuting) {
                        this.isExecuting = true;

                        // Camera entity dead, find next entity
                        this.executionTimeout = setTimeout(() => {
                            this.isExecuting = false;

                            // Dont change camera if player is not dead
                            if (!this.isDead) {
                                return;
                            }

                            // Ygg is the highest priority
                            const cameraEntity = findNearestEntity(this, [
                                poolThis.getAllMobs().filter(m => !m.petalParentPlayer && !m.petParentPlayer),
                                poolThis.getAllClients().filter(c => !c.isDead && c.id !== this.id),
                            ].flat());
                            if (!cameraEntity) {
                                this.playerCameraTargetEntity = null;
                            } else {
                                this.playerCameraTargetEntity = cameraEntity;
                            }
                        }, 1000);
                    }
                } else {
                    this.x = this.playerCameraTargetEntity.x;
                    this.y = this.playerCameraTargetEntity.y;
                }
            }
        }

        free() {
            if (super["free"]) {
                super["free"]();
            }

            clearTimeout(this.executionTimeout);
        }
    };
}