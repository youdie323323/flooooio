import PETAL_PROFILES from "../../../../Shared/Native/petal_profiles.json";
import { memo } from "../Utils/Memoize";
import type { MobType, PetalType } from "../Native/Entity/EntityType";

export const isPetal =
    <(type: MobType | PetalType) => type is PetalType>memo((type: MobType | PetalType): type is PetalType => type in PETAL_PROFILES);