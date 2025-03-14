import type { EntityData } from "../../EntityData";
import type { Rarity } from "../../EntityRarity";

export interface PetalI18n {
    name: string;
    fullName: string;
    description: string;
}

type BaseData = EntityData<PetalI18n>;

interface UnusablePetalStat {
    damage: number;
    health: number;
    petalReload: number;
    count: number;

    [key: string]: any;
}

interface UsablePetalStat extends UnusablePetalStat {
    usageReload: number;
}

export type PetalStat = UnusablePetalStat | UsablePetalStat;

export type PetalData = Readonly<
    BaseData
    & Record<Rarity, PetalStat>
>;