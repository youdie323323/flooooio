import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool } from "../../wave/WavePool";
import { BasePlayer, PlayerInstance } from "./Player";
import { isUnconvertableSlot } from "../mob/petal/Petal";
import { Mood, PetalType } from "../../../../shared/enum";
import { Rarities } from "../../../../shared/rarity";
import { EGG_TYPE_MAPPING } from "./PlayerPetalReload";

const consumeConsumable = (poolThis: WavePool, player: PlayerInstance, i: number, j: number) => {
    // If cooldown elapsed
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
                const dx = petal.x - player.x;
                const dy = petal.y - player.y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                const BOUNCE_FORCE = 50;

                player.x -= (dx / distance) * BOUNCE_FORCE;
                player.y -= (dy / distance) * BOUNCE_FORCE;

                break;
            }
        }

        // Reset cooldown
        player.slots.cooldownsUsage[i][j] = 0;
    }
};

export function PlayerPetalConsume<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            const isMoodConsume = this.mood === Mood.SAD;

            this.slots.surface.forEach((petals, i) => {
                if (petals != null && isUnconvertableSlot(petals)) {
                    petals.forEach((e, j) => {
                        // Automatically consume (e.g. egg)
                        if (poolThis.getMob(e.id) && e.type === PetalType.BEETLE_EGG) {
                            consumeConsumable(poolThis, this, i, j);
                        }

                        // Bubble
                        // Keeping mood in SAD causes server crash, i wonder why?
                        if (poolThis.getMob(e.id) && isMoodConsume && e.type === PetalType.BUBBLE) {
                            consumeConsumable(poolThis, this, i, j);
                        }
                    });
                }
            });
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}