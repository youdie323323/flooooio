import { Rarity } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import { MobType, PetalType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { decodeMood } from "../../../../../../Shared/Mood";
import type { WavePool } from "../../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, EntityMixinTemplate } from "../Entity";
import { onUpdateTick } from "../Entity";
import { isDynamicPetal } from "../Mob/Petal/Petal";
import type { PlayerInstance, BasePlayer } from "./Player";

export const EGG_TYPE_MAPPING = {
    [PetalType.EGG_BEETLE]: MobType.BEETLE,
} as const satisfies Partial<Record<PetalType, MobType>>;

const consumeConsumablePetal = (poolThis: WavePool, player: PlayerInstance, i: number, j: number): [number, number] | null => {
    const clusterLike = player.slots.surface[i];
    if (!isDynamicPetal(clusterLike)) return null;

    const petal = clusterLike[j];

    // Remove mob as it consumed
    poolThis.removeMob(petal.id);

    switch (petal.type) {
        case PetalType.EGG_BEETLE: {
            petal.petalSummonedPet = poolThis.generateMob(
                EGG_TYPE_MAPPING[petal.type],
                Math.max(Rarity.COMMON, Math.min(Rarity.MYTHIC, petal.rarity - 1)),

                // Summon on breaked petal
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

    return null;
};

export function PlayerPetalConsume<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly BUBBLE_BOUNCE_FORCE = 30;
        private static readonly BUBBLE_ATTENUATION_COEFFICIENT = 0.7;

        private bubbleVelocityX: number = 0;
        private bubbleVelocityY: number = 0;

        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            if (this.isDead) {
                return;
            }

            this.bubbleVelocityX *= MixedBase.BUBBLE_ATTENUATION_COEFFICIENT;
            this.bubbleVelocityY *= MixedBase.BUBBLE_ATTENUATION_COEFFICIENT;

            const [, isConsumeMood] = decodeMood(this.mood);

            this.slots.surface.forEach((petals, i) => {
                if (petals != null && isDynamicPetal(petals)) {
                    petals.forEach((e, j) => {
                        if (
                            // Check if petal is living
                            poolThis.getMob(e.id) &&
                            Date.now() >= this.slots.cooldownsUsage[i][j]
                        ) {
                            // Automatically (e.g. egg)
                            if (e.type === PetalType.EGG_BEETLE) {
                                consumeConsumablePetal(poolThis, this, i, j);

                                return;
                            }

                            // Bubble
                            if (isConsumeMood && e.type === PetalType.BUBBLE) {
                                const result = consumeConsumablePetal(poolThis, this, i, j);
                                if (result) {
                                    const distance = Math.sqrt(result[0] * result[0] + result[1] * result[1]);
                                    if (distance > 0) {
                                        this.bubbleVelocityX += result[0] / distance;
                                        this.bubbleVelocityY += result[1] / distance;
                                    }
                                }

                                return;
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