import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { MobType, PetalType } from "../../shared/types";

// Ill implements util function here because server-side source leak

export function isPetal(type: MobType | PetalType): boolean {
    return type in PETAL_PROFILES;
}