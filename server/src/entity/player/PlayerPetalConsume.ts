import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BasePlayer, PlayerInstance } from "./Player";
import { isLivingSlot } from "../mob/petal/Petal";
import { PetalType } from "../../../../shared/EntityType";
import { Rarities } from "../../../../shared/rarity";
import { EGG_TYPE_MAPPING } from "./PlayerPetalReload";
import { decodeMood, Mood } from "../../../../shared/mood";

const consumeConsumable = (poolThis: WavePool, player: PlayerInstance, i: number, j: number):
    // Dx, dy
    [number, number]
    | null => {
    if (Date.now() >= player.slots.cooldownsUsage[i][j]) {
        const cluster = player.slots.surface[i];
        if (!isLivingSlot(cluster)) {
            return null;
        }

        const petal = cluster[j];

        // Remove mob as it consumed
        poolThis.removeMob(petal.id);

        // Reset cooldown (maybe do cooldown reset instead of PlayerPetalReload?)
        // player.slots.cooldownsUsage[i][j] = 0;

        switch (petal.type) {
            case PetalType.BEETLE_EGG: {
                petal.petalSummonedPet = poolThis.generateMob(
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
                return [player.x - petal.x, player.y - petal.y];
            }
        }
    }

    return null;
};

export function PlayerPetalConsume<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly BUBBLE_BOUNCE_FORCE = 30;
        private static readonly BUBBLE_ATTENUATION_COEFFICIENT = 0.7;

        private bubbleVelocityX: number = 0;
        private bubbleVelocityY: number = 0;

        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            const { 1: isConsumeMood } = decodeMood(this.mood);

            this.bubbleVelocityX *= MixedBase.BUBBLE_ATTENUATION_COEFFICIENT;
            this.bubbleVelocityY *= MixedBase.BUBBLE_ATTENUATION_COEFFICIENT;

            this.slots.surface.forEach((petals, i) => {
                if (petals != null && isLivingSlot(petals)) {
                    petals.forEach((e, j) => {
                        if (poolThis.getMob(e.id)) {
                            // Automatically (e.g. egg)
                            if (e.type === PetalType.BEETLE_EGG) {
                                consumeConsumable(poolThis, this, i, j);
                                return;
                            };

                            // Bubble
                            if (isConsumeMood && e.type === PetalType.BUBBLE) {
                                const result = consumeConsumable(poolThis, this, i, j);
                                if (result) {
                                    const distance = Math.sqrt(result[0] * result[0] + result[1] * result[1]);
                                    if (distance > 0) {
                                        this.bubbleVelocityX += result[0] / distance;
                                        this.bubbleVelocityY += result[1] / distance;
                                    }
                                }
                            }
                        }
                    });
                }
            });

            this.x += this.bubbleVelocityX * MixedBase.BUBBLE_BOUNCE_FORCE;
            this.y += this.bubbleVelocityY * MixedBase.BUBBLE_BOUNCE_FORCE;
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}