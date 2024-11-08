import { MoodKind } from "../../../shared/packet";
import { onUpdateTick } from "../Entity";
import { EntityPool, FPS } from "../EntityPool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { MobType, PetalType } from "../../../shared/types";
import { PetalData } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { Rarities } from "../../../shared/rarities";

export const USAGE_RELOAD_PETALS: Set<PetalType | MobType> = new Set([
    PetalType.BEETLE_EGG,
]);

export const EGG_TYPE_MAPPING: Partial<Record<PetalType, MobType>> = {
    [PetalType.BEETLE_EGG]: MobType.BEETLE,
};

export function PlayerReload<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base {
        [onUpdateTick](poolThis: EntityPool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Dont reload if player is dead
            if (!this.isDead) {
                // Respawn petal if destroyed
                this.slots.surface.forEach((e, i) => {
                    // If e is not falsy and dont has e on mob pool, that means petal are breaked
                    // So if petal is breaked, start reloading
                    if (
                        e != null && !poolThis.getMob(e.id)
                    ) {
                        // If summoned mob is not dead, not reloading
                        if (e.petalSummonedMob && poolThis.getMob(e.petalSummonedMob.id)) {
                            return;
                        }
                        if (this.slots.cooldownsPetal[i] === 0) {
                            const profile = PETAL_PROFILES[e.type];
                            this.slots.cooldownsPetal[i] = Date.now() + (profile[e.rarity].petalReload * 1000);
                        }
                        // If cooldown elapsed
                        else if (Date.now() >= this.slots.cooldownsPetal[i]) {
                            this.slots.surface[i] = poolThis.addPetalOrMob(
                                e.type,
                                e.rarity,
                                // Make it player coordinate so its looks like spawning from players body
                                this.x,
                                this.y
                            );
                            this.slots.cooldownsPetal[i] = 0;
                        }
                    }
                });
                this.slots.surface.forEach((e, i) => {
                    if (e != null && poolThis.mobs.has(e.id) && e.isPetalEgg) {
                        if (this.slots.cooldownsUsage[i] === 0) {
                            const profile = PETAL_PROFILES[e.type];
                            this.slots.cooldownsUsage[i] = Date.now() + (profile[e.rarity].usageReload * 1000);
                        }
                        // If cooldown elapsed
                        else if (Date.now() >= this.slots.cooldownsUsage[i]) {
                            const summonMob = EGG_TYPE_MAPPING[e.type];
                            if (summonMob) {
                                // Null means its empty slot, so no need to set null
                                // this.slots.surface[i] = null;
                                poolThis.removeMob(e.id);
                                e.petalSummonedMob = poolThis.addPetalOrMob(
                                    summonMob,
                                    Math.max(Rarities.COMMON, Math.min(Rarities.MYTHIC, e.rarity - 1)),
                                    e.x,
                                    e.y,
                                    this,
                                );
                                this.slots.cooldownsUsage[i] = 0;
                            }
                        }
                    }
                });
            }
        }
    };
}