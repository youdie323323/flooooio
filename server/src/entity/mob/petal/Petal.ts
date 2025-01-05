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

interface PetalI18n {
    name: string;
    fullName: string;
    description: string;
}

export type PetalData = Readonly<BaseEntityData<PetalI18n> & {
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

/**
 * Slot placeholder.
 */
export type Slot = MockPetalData | MobInstance[] | null | undefined;

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