import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, WAVE_UPDATE_FPS } from "../../wave/WavePool";
import { Mob, MobInstance } from "../mob/Mob";
import { BasePlayer, PlayerInstance } from "./Player";
import { isUnconvertableSlot, PetalData } from "../mob/petal/Petal";
import { PetalType, MobType } from "../../../../shared/enum";
import { PETAL_PROFILES } from "../../../../shared/entity/mob/petal/petalProfiles";
import { isPetal } from "../../utils/common";

export const USAGE_RELOAD_PETALS: Set<PetalType> = new Set([
    PetalType.BEETLE_EGG,
    PetalType.BUBBLE,
]);

export const EGG_TYPE_MAPPING: Partial<Record<PetalType, MobType>> = {
    [PetalType.BEETLE_EGG]: MobType.BEETLE,
};

export function PlayerPetalReload<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            const surface = this.slots.surface;

            if (this.slots.bottom.length !== surface.length) {
                this.slots.bottom.length = surface.length;
                this.slots.cooldownsPetal = Array.from({ length: surface.length }, e => new Array(5).fill(0));
                this.slots.cooldownsUsage = Array.from({ length: surface.length }, e => new Array(5).fill(0));
            }

            // Dont reload if player is dead
            if (!this.isDead) {
                // Respawn petal if destroyed
                surface.forEach((petals, i) => {
                    // If e is not falsy and dont has e on mob pool, that means petal are breaked
                    // So if petal is breaked, start reloading
                    if (petals != null && isUnconvertableSlot(petals)) {
                        petals.forEach((e, j) => {
                            if (!poolThis.getMob(e.id)) {
                                // If summoned mob is not dead, not reloading
                                if (e.petalSummonedPet && poolThis.getMob(e.petalSummonedPet.id)) {
                                    return;
                                }

                                const eCooldownsPetal = this.slots.cooldownsPetal[i];

                                if (eCooldownsPetal[j] === 0) {
                                    const profile = PETAL_PROFILES[e.type];
                                    eCooldownsPetal[j] = Date.now() + (profile[e.rarity].petalReload * 1000);
                                }
                                // If cooldown elapsed
                                else if (Date.now() >= eCooldownsPetal[j]) {
                                    petals[j] = poolThis.addPetalOrMob(
                                        e.type,
                                        e.rarity,

                                        // Make it player coordinate so its looks like spawning from player body
                                        this.x,
                                        this.y,

                                        this,
                                        null,
                                    );

                                    eCooldownsPetal[j] = 0;
                                }
                            }
                        })
                    }
                });

                surface.forEach((petals, i) => {
                    if (petals != null && isUnconvertableSlot(petals)) {
                        petals.forEach((e, j) => {
                            if (isPetal(e.type) && USAGE_RELOAD_PETALS.has(e.type)) {
                                const eCooldownsUsage = this.slots.cooldownsUsage[i];

                                if (poolThis.getMob(e.id)) {
                                    // Petal respawned, start consume timer
                                    if (eCooldownsUsage[j] === 0) {
                                        const profile = PETAL_PROFILES[e.type];
                                        eCooldownsUsage[j] = Date.now() + (profile[e.rarity].usageReload * 1000);
                                    }
                                } else {
                                    // Reset cooldown because its breaked
                                    eCooldownsUsage[j] = 0;
                                }
                            }
                        });
                    }
                });
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}