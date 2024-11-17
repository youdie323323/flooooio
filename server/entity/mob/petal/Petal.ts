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
 * Mock data of {@link Mob}.
 * 
 * @remarks
 * 
 * This data for visualize petals in wave room, inventory and slots.
 * Eliminates the need for the server to create the actual living “Mob” instance.
 */
export interface MockPetalData {
    type: PetalType;
    rarity: Rarities;
}

export type MaybeEmptySlot<T> = T | null;

export interface PetalSlots {
    surface: MaybeEmptySlot<MockPetalData | MobInstance>[];
    bottom: MaybeEmptySlot<MockPetalData | MobInstance>[];
}

/**
 * Type guard for slot.
 */
export function isLivingPetal(slot: MockPetalData | MobInstance): slot is MobInstance {
    return "id" in slot;
}