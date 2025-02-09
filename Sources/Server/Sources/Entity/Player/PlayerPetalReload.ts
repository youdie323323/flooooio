import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../Wave/WavePool";
import { BasePlayer, PlayerInstance } from "./Player";
import { isLivingSlot } from "../Mob/Petal/Petal";
import { PetalType, MobType } from "../../../../Shared/EntityType";
import { PETAL_PROFILES } from "../../../../Shared/Entity/Mob/Petal/petalProfiles";
import { isPetal } from "../../Utils/common";
import { decodeMood } from "../../../../Shared/mood";
import { Rarity } from "../../../../Shared/rarity";
import { MAX_CLUSTER_AMOUNT } from "./PlayerPetalOrbit";

export const PETAL_INITIAL_COOLDOWN = 0;

export const USAGE_RELOAD_PETALS: Set<PetalType> = new Set([
    PetalType.BeetleEgg,
    PetalType.Bubble,
]);

export const EGG_TYPE_MAPPING = {
    [PetalType.BeetleEgg]: MobType.Beetle,
} satisfies Partial<Record<PetalType, MobType>>;

const consumeConsumable = (poolThis: WavePool, player: PlayerInstance, i: number, j: number):
    // Dx, dy
    [number, number]
    | null => {
    const clusterLike = player.slots.surface[i];
    if (!isLivingSlot(clusterLike)) return null;

    const petal = clusterLike[j];

    // Remove mob as it consumed
    poolThis.removeMob(petal.id);

    switch (petal.type) {
        case PetalType.BeetleEgg: {
            petal.petalSummonedPet = poolThis.generateMob(
                EGG_TYPE_MAPPING[petal.type],
                Math.max(Rarity.Common, Math.min(Rarity.Mythic, petal.rarity - 1)),

                // Summon on breaked petal
                petal.x,
                petal.y,

                null,
                player,
            );

            break;
        }

        case PetalType.Bubble: {
            return [player.x - petal.x, player.y - petal.y];
        }
    }

    return null;
};

export function PlayerPetalReload<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly BUBBLE_BOUNCE_FORCE = 30;
        private static readonly BUBBLE_ATTENUATION_COEFFICIENT = 0.7;

        private bubbleVelocityX: number = 0;
        private bubbleVelocityY: number = 0;

        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            const surface = this.slots.surface;

            if (this.slots.bottom.length !== surface.length) {
                this.slots.bottom.length = surface.length;
            }

            if (this.slots.cooldownsPetal.length !== surface.length) {
                this.slots.cooldownsPetal = Array.from({ length: surface.length }, e => new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN));
                this.slots.cooldownsUsage = Array.from({ length: surface.length }, e => new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN));
            }

            // Dont reload if player is dead
            if (!this.isDead) {
                // Reload logic
                {
                    surface.forEach((petals, i) => {
                        if (petals !== null && isLivingSlot(petals)) {
                            petals.forEach((e, j) => {
                                if (
                                    // Petal breaked, start reloading
                                    !poolThis.getMob(e.id)
                                ) {
                                    // If summoned mob is not dead, not reloading
                                    if (e.petalSummonedPet && poolThis.getMob(e.petalSummonedPet.id)) return;

                                    const cooldownPetal = this.slots.cooldownsPetal[i];

                                    if (cooldownPetal[j] === PETAL_INITIAL_COOLDOWN) {
                                        const profile = PETAL_PROFILES[e.type];
                                        cooldownPetal[j] = Date.now() + (profile[e.rarity].petalReload * 1000);
                                    }
                                    // If cooldown elapsed
                                    else if (Date.now() >= cooldownPetal[j]) {
                                        petals[j] = poolThis.generateMob(
                                            e.type,
                                            e.rarity,

                                            // Make it player coordinate so its looks like spawning from player body
                                            // TODO: It may not appear to be coming from the player, because the setInterval for sending update packets and 
                                            // the setInterval for update are different. To solve this, delay PlayerPetalOrbit
                                            this.x,
                                            this.y,

                                            this,
                                            null,
                                        );

                                        cooldownPetal[j] = PETAL_INITIAL_COOLDOWN;
                                    }
                                }
                            })
                        }
                    });

                    surface.forEach((petals, i) => {
                        if (petals != null && isLivingSlot(petals)) {
                            petals.forEach((e, j) => {
                                if (
                                    isPetal(e.type) &&
                                    USAGE_RELOAD_PETALS.has(e.type)
                                ) {
                                    const cooldownUsage = this.slots.cooldownsUsage[i];

                                    if (
                                        // Can use petal
                                        poolThis.getMob(e.id)
                                    ) {
                                        // Petal respawned, start consume timer
                                        if (cooldownUsage[j] === PETAL_INITIAL_COOLDOWN) {
                                            const profile = PETAL_PROFILES[e.type];
                                            cooldownUsage[j] = Date.now() + (profile[e.rarity].usageReload * 1000);
                                        }
                                    } else {
                                        // Reset cooldown because its breaked
                                        cooldownUsage[j] = PETAL_INITIAL_COOLDOWN;
                                    }
                                }
                            });
                        }
                    });
                }

                // Consume logic
                {
                    const { 1: isConsumeMood } = decodeMood(this.mood);

                    this.bubbleVelocityX *= MixedBase.BUBBLE_ATTENUATION_COEFFICIENT;
                    this.bubbleVelocityY *= MixedBase.BUBBLE_ATTENUATION_COEFFICIENT;

                    this.slots.surface.forEach((petals, i) => {
                        if (petals != null && isLivingSlot(petals)) {
                            petals.forEach((e, j) => {
                                if (
                                    // Check if petal is living
                                    poolThis.getMob(e.id) &&
                                    Date.now() >= this.slots.cooldownsUsage[i][j]
                                ) {
                                    // Automatically (e.g. egg)
                                    if (e.type === PetalType.BeetleEgg) {
                                        consumeConsumable(poolThis, this, i, j);
                                        return;
                                    };

                                    // Bubble
                                    if (isConsumeMood && e.type === PetalType.Bubble) {
                                        const result = consumeConsumable(poolThis, this, i, j);
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
            }
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}