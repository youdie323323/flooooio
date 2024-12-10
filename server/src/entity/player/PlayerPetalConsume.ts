import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BasePlayer, PlayerInstance } from "./Player";
import { isUnconvertableSlot } from "../mob/petal/Petal";
import { Mood, PetalType } from "../../../../shared/enum";
import { Rarities } from "../../../../shared/rarity";
import { EGG_TYPE_MAPPING } from "./PlayerPetalReload";

const consumeConsumable = (poolThis: WavePool, player: PlayerInstance, i: number, j: number):
    // Bubble velocity
    [number, number]
    | null => {
    if (Date.now() >= player.slots.cooldownsUsage[i][j]) {
        const cluster = player.slots.surface[i];
        if (!isUnconvertableSlot(cluster)) {
            return;
        }

        const petal = cluster[j];
        poolThis.removeMob(petal.id);

        switch (petal.type) {
            case PetalType.BEETLE_EGG: {
                petal.petalSummonedPet = poolThis.addPetalOrMob(
                    EGG_TYPE_MAPPING[petal.type],
                    Math.max(Rarities.COMMON, Math.min(Rarities.MYTHIC, petal.rarity - 1)),
                    petal.x,
                    petal.y,
                    null,
                    player,
                );
                break;
            }

            case PetalType.BUBBLE: {
                return [petal.x - player.x, petal.y - player.y];
            }
        }

        player.slots.cooldownsUsage[i][j] = 0;
    }

    return null;
};

const BUBBLE_BOUNCE_FORCE = 50;

export function PlayerPetalConsume<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            const isMoodConsume = this.mood === Mood.SAD;

            let totalDx = 0;
            let totalDy = 0;
            let bubbleCount = 0;

            this.slots.surface.forEach((petals, i) => {
                if (petals != null && isUnconvertableSlot(petals)) {
                    petals.forEach((e, j) => {
                        if (poolThis.getMob(e.id)) {
                            // Automatically (e.g. egg)
                            if (e.type === PetalType.BEETLE_EGG) {
                                consumeConsumable(poolThis, this, i, j);
                                return;
                            };

                             // Bubble
                             if (isMoodConsume && e.type === PetalType.BUBBLE) {
                                const result = consumeConsumable(poolThis, this, i, j);
                                if (result) {
                                    const distance = Math.sqrt(result[0] * result[0] + result[1] * result[1]);
                                    if (distance > 0) {
                                        totalDx += (result[0] / distance);
                                        totalDy += (result[1] / distance);
                                        bubbleCount++;
                                    }
                                }
                            }
                        }
                    });
                }
            });

            if (bubbleCount > 0) {
                const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
                if (totalDistance > 0) {
                    this.x -= (totalDx / totalDistance) * BUBBLE_BOUNCE_FORCE * bubbleCount;
                    this.y -= (totalDy / totalDistance) * BUBBLE_BOUNCE_FORCE * bubbleCount;
                }
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}