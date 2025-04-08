import type { Rarity } from "../../../../Public/Sources/Native/Rarity";
import type { EntityData, ExtraStats } from "../EntityData";

export interface MobI18n {
    name: string;
    description: string;
}

export interface MobStat {
    bodyDamage: number;
    health: number;

    extra?: ExtraStats;
}

export type MobData = Readonly<
    & EntityData<MobI18n>
    & {
        baseSize: number;
    }
    & Record<Rarity, MobStat>
>;