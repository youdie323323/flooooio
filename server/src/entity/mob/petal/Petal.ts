import { PetalType } from "../../../../../shared/EntityType";
import { Rarities } from "../../../../../shared/rarity";
import { BaseEntityData } from "../../Entity";
import { MobInstance } from "../Mob";

export type PetalStat = Readonly<{
    damage: number;
    health: number;
    petalReload: number;
    usageReload?: number;
    count: number;

    isCluster: boolean;

    [key: string]: any;
}>;

export type PetalData = BaseEntityData & Readonly<{
    [Rarities.COMMON]: PetalStat;
    [Rarities.UNUSUAL]: PetalStat;
    [Rarities.RARE]: PetalStat;
    [Rarities.EPIC]: PetalStat;
    [Rarities.LEGENDARY]: PetalStat;
    [Rarities.MYTHIC]: PetalStat;
    [Rarities.ULTRA]: PetalStat;
    [Rarities.SUPER]: PetalStat;
}>;

/**
 * Mock data of {@link Mob}.
 * 
 * @remarks
 * 
 * This data for visualize petals in wave room, inventory and slots.
 * Eliminates the need for the server to create the actual living “Mob” instance.
 */
export type MockPetalData = Readonly<{
    type: PetalType;
    rarity: Rarities;
}>;

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
export function isLivingSlot(slot: Slot): slot is MobInstance[] {
    return Array.isArray(slot);
}