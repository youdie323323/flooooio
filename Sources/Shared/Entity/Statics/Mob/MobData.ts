import { Rarity } from "../EntityRarity";
import { EntityData } from "../EntityData";

export interface MobI18n {
    name: string;
    description: string;
}

export interface MobStat {
    bodyDamage: number;
    health: number;

    [key: string]: any;
}

export type MobData = Readonly<
    | EntityData<MobI18n>
    & {
        baseSize: number;

        // TODO: replace these with MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR

        [Rarity.Common]: MobStat;
        [Rarity.Unusual]: MobStat;
        [Rarity.Rare]: MobStat;
        [Rarity.Epic]: MobStat;
        [Rarity.Legendary]: MobStat;
        [Rarity.Mythic]: MobStat;
        [Rarity.Ultra]: MobStat;
    }
>;