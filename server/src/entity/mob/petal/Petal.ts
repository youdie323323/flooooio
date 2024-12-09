import { PetalType } from "../../../../../shared/enum";
import { Rarities } from "../../../../../shared/rarity";
import { MobInstance } from "../Mob";

export interface PetalStat {
    damage: number;
    health: number;
    petalReload: number;
    usageReload?: number;
    count: number;

    isCluster: boolean;

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

type MaybeEmptySlot<T> = T | null | undefined;

/**
 * Slot placeholder.
 * 
 * @remarks
 * 
 * Multiple mob instance is because of we have petals like sand (they have 4 entities)
 */
export type Slot = MaybeEmptySlot<MockPetalData | MobInstance[]>;

export interface PetalSlots {
    surface: Slot[];
    bottom: Slot[];
}

/**
 * Type guard for slot.
 */
export function isUnconvertableSlot(slot: Slot): slot is MobInstance[] {
    return Array.isArray(slot);
}