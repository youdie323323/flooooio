import { memo } from "../../../../Utils/Memoize";
import type { MobType, PetalType } from "../../../Statics/EntityType";
import { PETAL_PROFILES } from "../../../Statics/Mob/Petal/PetalProfiles";

export const isPetal = <(type: MobType | PetalType) => type is PetalType>memo((type: MobType | PetalType): type is PetalType => type in PETAL_PROFILES);
