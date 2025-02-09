import { PetalType } from "../../../../../Shared/EntityType";
import { Rarity } from "../../../../../Shared/rarity";
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

export type PetalData = Readonly<
    BaseEntityData<PetalI18n>
    & {
        [Rarity.Common]: PetalStat;
        [Rarity.Unusual]: PetalStat;
        [Rarity.Rare]: PetalStat;
        [Rarity.Epic]: PetalStat;
        [Rarity.Legendary]: PetalStat;
        [Rarity.Mythic]: PetalStat;
        [Rarity.Ultra]: PetalStat;
    }
>;

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
    rarity: Rarity;
}>;

export type ClusterLike = MobInstance[];

/**
 * Slot placeholder.
 */
export type Slot = MockPetalData | ClusterLike | null;

export interface PetalSlots {
    surface: Slot[];
    bottom: Slot[];
}

/**
 * Determine if slot is cluster like.
 */
export function isLivingSlot(slot: Slot): slot is ClusterLike {
    return Array.isArray(slot);
}