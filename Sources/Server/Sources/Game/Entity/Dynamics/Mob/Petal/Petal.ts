import { Rarity } from "../../../../../../../Shared/Entity/Statics/EntityRarity";
import { PetalType } from "../../../../../../../Shared/Entity/Statics/EntityType";
import { MobInstance } from "../Mob";

/**
 * Static data of {@link Mob}.
 * 
 * @remarks
 * 
 * This data for visualize petals in wave room, inventory and slots.
 * Eliminates the need for the server to create the actual living “Mob” instance.
 */
export type StaticPetalData = Readonly<{
    type: PetalType;
    rarity: Rarity;
}>;

export const MAX_CLUSTER_AMOUNT = 5;

export type SinglePetal = [MobInstance];

export type MaybeClusterPetal =
    // Unclustered (single)
    | SinglePetal
    // Clustered (multiple)
    | [MobInstance, MobInstance]
    | [MobInstance, MobInstance, MobInstance]
    | [MobInstance, MobInstance, MobInstance, MobInstance]
    | [MobInstance, MobInstance, MobInstance, MobInstance, MobInstance];

export type ClusterPetal = Exclude<MaybeClusterPetal, SinglePetal>;

export function isClusterPetal(petals: MaybeClusterPetal): petals is ClusterPetal {
    return petals.length > 1;
}

/**
 * Slot placeholder.
 */
export type Slot = StaticPetalData | MaybeClusterPetal | null;

/**
 * Determine if slot is dynamic.
 */
export function isDynamicPetal(slot: Slot): slot is MaybeClusterPetal {
    return Array.isArray(slot);
}

export interface PetalSlots {
    surface: Slot[];
    bottom: Slot[];
}