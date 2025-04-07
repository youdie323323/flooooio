import type { EntityData } from "../../EntityData";
import type { Rarity } from "../../EntityRarity";

export interface PetalI18n {
    name: string;
    fullName: string;
    description: string;
}

type BaseData = EntityData<PetalI18n>;

export interface PetalStat {
    damage: number;
    health: number;
    petalReload: number;
    usageReload?: number;
    count: number;

    extra?: Record<string, any>;
}

export type PetalData = Readonly<
    BaseData
    & Record<Rarity, PetalStat>
>;