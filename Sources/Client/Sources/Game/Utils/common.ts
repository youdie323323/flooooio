import { MobType, PetalType } from "../../../../Shared/Entity/Statics/EntityType";
import { PETAL_PROFILES } from "../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import { memo } from "../../../../Shared/Utils/Memoize";

export const isPetal = memo((type: MobType | PetalType): type is PetalType => {
    return type in PETAL_PROFILES;
});