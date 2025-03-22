import type { Rarity } from "../../../../../../../Shared/Entity/Statics/EntityRarity";
import type { PetalType } from "../../../../../../../Shared/Entity/Statics/EntityType";
import type { MobInstance } from "../Mob";

/**
 * Static data of {@link Mob}.
 * 
 * @remarks
 * This data for visualize petals in wave room, inventory and slots.
 * Eliminates the need for the server to create the actual living “Mob” instance.
 */
export type StaticPetalData = Readonly<{
    type: PetalType;
    rarity: Rarity;
}>;

// Unclustered (single)
export type SinglePetal = [MobInstance];

export const MAX_CLUSTER_AMOUNT = 5;

// Clustered (multiple)
export type ClusterPetal =
    | [...SinglePetal, ...SinglePetal]
    | [...SinglePetal, ...SinglePetal, ...SinglePetal]
    | [...SinglePetal, ...SinglePetal, ...SinglePetal, ...SinglePetal]
    | [...SinglePetal, ...SinglePetal, ...SinglePetal, ...SinglePetal, ...SinglePetal];

export type DynamicPetal =
    | SinglePetal
    | ClusterPetal;

export function isClusterPetal(petal: DynamicPetal): petal is ClusterPetal {
    return petal.length > 1;
}

/**
 * Determine if slot is dynamic (living).
 */
export function isDynamicPetal(slot: Slot): slot is DynamicPetal {
    return Array.isArray(slot);
}

/**
 * Slot placeholder.
 */
export type Slot = StaticPetalData | DynamicPetal | null;

export interface PetalSlots {
    surface: Array<Slot>;
    bottom: Array<Slot>;
}