import { EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BasePlayer } from "./Player";
import { isSpawnableSlot } from "../mob/petal/Petal";
import { consumeConsumable } from "./PlayerPetalReload";
import { Mood, PetalType } from "../../../shared/enum";

export function PlayerPetalConsume<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            const isMoodConsume = this.mood === Mood.SAD;

            this.slots.surface.forEach((petals, i) => {
                if (petals != null && isSpawnableSlot(petals)) {
                    petals.forEach((e, j) => {
                        // Automatically consume (e.g. egg)
                        if (poolThis.getMob(e.id) && e.type === PetalType.BEETLE_EGG) {
                            consumeConsumable(poolThis, this, e, i, j);
                        }

                        // Bubble
                        // Keeping mood in SAD causes server crash, i wonder why?
                        // if (poolThis.getMob(e.id) && isMoodConsume && e.type === PetalType.BUBBLE) {
                        //     consumeConsumable(poolThis, this, e, i, j);
                        // }
                    });
                }
            });
        }

        free() {
            if (super["free"]) {
                super["free"]();
            }
        }
    };
}