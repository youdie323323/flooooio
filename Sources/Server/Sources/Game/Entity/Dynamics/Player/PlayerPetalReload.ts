import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import type { MobType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { PetalType } from "../../../../../../Shared/Entity/Statics/EntityType";
import type { PetalData } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import type { WavePool } from "../../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, EntityMixinTemplate } from "../Entity";
import { ON_UPDATE_TICK } from "../Entity";
import { isDynamicPetal, MAX_CLUSTER_AMOUNT } from "../Mob/Petal/Petal";
import type { BasePlayer } from "./Player";
import PETAL_PROFILES from "../../../../../../Shared/Native/petal_profiles.json";

export const PETAL_INITIAL_COOLDOWN = 0;

export const USAGE_RELOAD_PETALS: Set<MobType | PetalType> = new Set([
    PetalType.EGG_BEETLE,
    PetalType.BUBBLE,
]);

export function PlayerPetalReload<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        [ON_UPDATE_TICK](poolThis: WavePool): void {
            super[ON_UPDATE_TICK](poolThis);

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
                surface.forEach((petals, i) => {
                    if (petals !== null && isDynamicPetal(petals)) {
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
                                } else if (Date.now() >= cooldownPetal[j]) {
                                    // If cooldown elapsed

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
                        });
                    }
                });

                surface.forEach((petals, i) => {
                    if (petals != null && isDynamicPetal(petals)) {
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
                                        const profile: PetalData = PETAL_PROFILES[e.type];
                                        cooldownUsage[j] = Date.now() + (profile[e.rarity].extra.usageReload * 1000);
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
        }
    };
}