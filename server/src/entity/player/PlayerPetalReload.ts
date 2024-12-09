import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, WAVE_UPDATE_FPS } from "../../wave/WavePool";
import { Mob, MobInstance } from "../mob/Mob";
import { BasePlayer, PlayerInstance } from "./Player";
import { isUnconvertableSlot, PetalData } from "../mob/petal/Petal";
import { PetalType, MobType } from "../../../../shared/enum";
import { PETAL_PROFILES } from "../../../../shared/entity/mob/petal/petalProfiles";
import { Rarities } from "../../../../shared/rarity";

export const USAGE_RELOAD_PETALS: Set<PetalType | MobType> = new Set([
    PetalType.BEETLE_EGG,
]);

export const EGG_TYPE_MAPPING: Partial<Record<PetalType, MobType>> = {
    [PetalType.BEETLE_EGG]: MobType.BEETLE,
};

export function PlayerReload<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
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

                                if (this.slots.cooldownsPetal[i][j] === 0) {
                                    const profile = PETAL_PROFILES[e.type];
                                    this.slots.cooldownsPetal[i][j] = Date.now() + (profile[e.rarity].petalReload * 1000);
                                }
                                // If cooldown elapsed
                                else if (Date.now() >= this.slots.cooldownsPetal[i][j]) {
                                    petals[j] = poolThis.addPetalOrMob(
                                        e.type,
                                        e.rarity,

                                        // Make it player coordinate so its looks like spawning from player body
                                        this.x,
                                        this.y,

                                        this,
                                        null,
                                    );

                                    this.slots.cooldownsPetal[i][j] = 0;
                                }
                            }
                        })
                    }
                });

                surface.forEach((petals, i) => {
                    if (petals != null && isUnconvertableSlot(petals)) {
                        petals.forEach((e, j) => {
                            if (e.petalIsUsage) {
                                if (poolThis.getMob(e.id)) {
                                    if (this.slots.cooldownsUsage[i][j] === 0) {
                                        const profile = PETAL_PROFILES[e.type];
                                        this.slots.cooldownsUsage[i][j] = Date.now() + (profile[e.rarity].usageReload * 1000);
                                    }
                                } else {
                                    // Reset cooldown because its breaked
                                    this.slots.cooldownsUsage[i][j] = 0;
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