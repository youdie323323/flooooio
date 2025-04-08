import type { MobType, PetalType } from "../../Client/Public/Sources/Game/Entity/EntityType";
import type { MobData } from "../Entity/Statics/Mob/MobData";
import type { PetalData } from "../Entity/Statics/Mob/Petal/PetalData";

declare module './mob_profiles.json' {
    const value: Record<MobType, MobData>;
    export = value;
}

declare module './petal_profiles.json' {
    const value: Record<PetalType, PetalData>;
    export = value;
}