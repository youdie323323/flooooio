import { EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, UPDATE_FPS } from "../../wave/WavePool";
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

        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            if (this.isDead) {
                const isFindable: boolean =
                    !this.playerDeadCameraTargetEntity ||
                    !(poolThis.getMob(this.playerDeadCameraTargetEntity.id) || poolThis.getClient(this.playerDeadCameraTargetEntity.id));

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
                                this.playerDeadCameraTargetEntity = null;
                            } else {
                                this.playerDeadCameraTargetEntity = cameraEntity;
                            }
                        }, 1000);
                    }
                } else {
                    this.x = this.playerDeadCameraTargetEntity.x;
                    this.y = this.playerDeadCameraTargetEntity.y;
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