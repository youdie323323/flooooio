import { Rarities } from "../../../../shared/rarities";
import { PetalType } from "../../../../shared/types";

export interface PetalStat {
    damage: number;
    health: number;
    petalReload: number;
    count: number;
    [key: string]: any;
}

export interface PetalData {
    name: string;
    description: string;
    // Canvas common
    fraction: number;
    rx: number;
    ry: number;

    [Rarities.COMMON]: PetalStat;
    [Rarities.UNUSUAL]: PetalStat;
    [Rarities.RARE]: PetalStat;
    [Rarities.EPIC]: PetalStat;
    [Rarities.LEGENDARY]: PetalStat;
    [Rarities.MYTHIC]: PetalStat;
    [Rarities.ULTRA]: PetalStat;
    [Rarities.SUPER]: PetalStat;
}