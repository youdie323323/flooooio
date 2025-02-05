import { PetalType } from "../../../../../Shared/EntityType";
import { Rarities } from "../../../../../Shared/rarity";
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
        [Rarities.Common]: PetalStat;
        [Rarities.Unusual]: PetalStat;
        [Rarities.Rare]: PetalStat;
        [Rarities.Epic]: PetalStat;
        [Rarities.Legendary]: PetalStat;
        [Rarities.Mythic]: PetalStat;
        [Rarities.Ultra]: PetalStat;
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
    rarity: Rarities;
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