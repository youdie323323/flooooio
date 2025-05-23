import type { Rarity } from "../../../../../Public/Sources/Native/Rarity";
import type { EntityData, ExtraStats } from "../../EntityData";

export interface PetalI18n {
    name: string;
    fullName: string;
    description: string;
}

export interface PetalStat {
    damage: number;
    health: number;
    petalReload: number;
    usageReload?: number;
    count: number;

    extra?: ExtraStats;
}

export type PetalData = Readonly<
    & EntityData<PetalI18n>
    & Record<Rarity, PetalStat>
>;