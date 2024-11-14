import { Rarities } from "../../../../shared/rarities";
import { PetalType } from "../../../../shared/types";
import { MobInstance } from "../Mob";

export interface PetalStat {
    damage: number;
    health: number;
    petalReload: number;
    usageReload?: number;
    count: number;
    [key: string]: any;
}

export interface PetalData {
    name: string;
    description: string;
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

/**
 * Dummy data of {@link Mob}.
 * 
 * @remarks
 * 
 * This data for visualize petals in wave room, inventory and slots.
 * Eliminates the need for the server to create the actual living “Mob” instance.
 */
export interface StaticPetalData {
    type: PetalType;
    rarity: Rarities;
}

export type MaybeEmptySlot<T> = T | null;

export interface PetalSlots {
    surface: MaybeEmptySlot<StaticPetalData | MobInstance>[];
    bottom: MaybeEmptySlot<StaticPetalData | MobInstance>[];
}

/**
 * Type guard for slot.
 */
export function isLivingPetal(slot: StaticPetalData | MobInstance): slot is MobInstance {
    // Its have id because living
    return "id" in slot;
}