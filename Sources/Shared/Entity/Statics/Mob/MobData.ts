import type { Rarity } from "../EntityRarity";
import type { EntityData } from "../EntityData";

export interface MobI18n {
    name: string;
    description: string;
}

export interface MobStat {
    bodyDamage: number;
    health: number;

    extra?: Record<string, any>;
}

export type MobData = Readonly<
    | EntityData<MobI18n>
    & {
        baseSize: number;

        // TODO: replace these with MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR

        [Rarity.COMMON]: MobStat;
        [Rarity.UNUSUAL]: MobStat;
        [Rarity.RARE]: MobStat;
        [Rarity.EPIC]: MobStat;
        [Rarity.LEGENDARY]: MobStat;
        [Rarity.MYTHIC]: MobStat;
        [Rarity.ULTRA]: MobStat;
    }
>;