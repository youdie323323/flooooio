import { Rarity } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import { MobType, PetalType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { decodeMood } from "../../../../../../Shared/Mood";
import type { WavePool } from "../../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, EntityMixinTemplate } from "../Entity";
import { ON_UPDATE_TICK } from "../Entity";
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
                petal.x,
                petal.y,
                null,
                player,
            );
            
            break;
        }

        case PetalType.BUBBLE: {
            const dx = player.x - petal.x;
            const dy = player.y - petal.y;

            return [dx, dy];
        }
    }

    return null;
};

export function PlayerPetalConsume<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly BUBBLE_BOUNCE_FORCE = 20;
        private static readonly BUBBLE_VELOCITY_ATTENUATION = 0.8;

        private bubbleVelocityX: number = 0;
        private bubbleVelocityY: number = 0;

        [ON_UPDATE_TICK](poolThis: WavePool): void {
            super[ON_UPDATE_TICK](poolThis);

            if (this.isDead) return;

            this.bubbleVelocityX *= MixedBase.BUBBLE_VELOCITY_ATTENUATION;
            this.bubbleVelocityY *= MixedBase.BUBBLE_VELOCITY_ATTENUATION;

            const [, isConsumeMood] = decodeMood(this.mood);

            let totalForceX = 0;
            let totalForceY = 0;

            this.slots.surface.forEach((petals, i) => {
                if (petals != null && isDynamicPetal(petals)) {
                    petals.forEach((e, j) => {
                        if (
                            poolThis.getMob(e.id) &&
                            Date.now() >= this.slots.cooldownsUsage[i][j]
                        ) {
                            if (e.type === PetalType.EGG_BEETLE) {
                                consumeConsumablePetal(poolThis, this, i, j);

                                return;
                            }

                            if (isConsumeMood && e.type === PetalType.BUBBLE) {
                                const result = consumeConsumablePetal(poolThis, this, i, j);
                                if (result) {
                                    const [dx, dy] = result;
                                    const distance = Math.sqrt(dx * dx + dy * dy);

                                    if (distance > 0) {
                                        totalForceX += dx / distance;
                                        totalForceY += dy / distance;
                                    }
                                }

                                return;
                            }
                        }
                    });
                }
            });

            this.bubbleVelocityX += totalForceX;
            this.bubbleVelocityY += totalForceY;

            this.x += this.bubbleVelocityX * MixedBase.BUBBLE_BOUNCE_FORCE;
            this.y += this.bubbleVelocityY * MixedBase.BUBBLE_BOUNCE_FORCE;
        }
    };
}