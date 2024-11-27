import { EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, UPDATE_FPS } from "../../wave/WavePool";
import { Mob, MobInstance } from "../mob/Mob";
import { BasePlayer, PlayerInstance } from "./Player";
import { isSpawnableSlot, PetalData } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { PetalType, MobType } from "../../../shared/enum";
import { Rarities } from "../../../shared/rarity";

export const USAGE_RELOAD_PETALS: Set<PetalType | MobType> = new Set([
    PetalType.BEETLE_EGG,
]);

export const EGG_TYPE_MAPPING: Partial<Record<PetalType, MobType>> = {
    [PetalType.BEETLE_EGG]: MobType.BEETLE,
};

export const consumeConsumable = (poolThis: WavePool, player: PlayerInstance, petal: MobInstance, i: number, j: number) => {
    // If cooldown elapsed
    if (Date.now() >= player.slots.cooldownsUsage[i][j]) {
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
                const dx = petal.x - player.x;
                const dy = petal.y - player.y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                const BOUNCE_FORCE = 100;
                player.x -= (dx / distance) * BOUNCE_FORCE;
                player.y -= (dy / distance) * BOUNCE_FORCE;

                break;
            }
        }

        player.slots.cooldownsUsage[i][j] = 0;
    }
};

export function PlayerReload<T extends new (...args: any[]) => BasePlayer>(Base: T) {
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
                    if (petals != null && isSpawnableSlot(petals)) {
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
                    if (petals != null && isSpawnableSlot(petals)) {
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

        free() {
            if (super["free"]) {
                super["free"]();
            }
        }
    };
}