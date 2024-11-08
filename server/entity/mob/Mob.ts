import { MobType, PetalType } from "../../../shared/types";
import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { Entity } from "../Entity";
import { MobOscillatingMovement } from "./MobOscillatingMovement";
import { MobAggressivePursuit } from "./MobAggressivePursuit";
import { EntityLinearMovement } from "../EntityLinearMovement";
import { EntityChecksum } from "../EntityChecksum";
import { Rarities } from "../../../shared/rarities";
import { BasePlayer, PlayerInstance } from "../player/Player";
import { MobHealthRegen } from "./MobHealthRegen";

// Note that i will call petal as mob

class BaseMob implements Entity {
    id: number;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    rarity: Rarities;
    maxHealth: number;
    type: MobType | PetalType;

    targetEntity: Entity | null;

    petalParent?: PlayerInstance;
    lastAttacked: Entity | null;

    parentEgger: PlayerInstance | null;
    petGoingToPlayer: boolean;
    isPetalEgg: boolean;
    summonedMob: MobInstance | null;

    starfishRegeningHealth: boolean;
}

let Mob = BaseMob;
Mob = EntityCollisionResponse(Mob);
Mob = EntityLinearMovement(Mob);
Mob = EntityChecksum(Mob);
Mob = MobOscillatingMovement(Mob);
Mob = MobAggressivePursuit(Mob);
Mob = MobHealthRegen(Mob);

type MobInstance = InstanceType<typeof Mob>;

interface MobStat {
    bodyDamage: number;
    health: number;
    [key: string]: any;
}

interface MobData {
    name: string;
    description: string;
    baseSize: number;
    // Canvas common
    fraction: number;
    rx: number;
    ry: number;

    // TODO: replace these with MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR

    [Rarities.COMMON]: MobStat;
    [Rarities.UNUSUAL]: MobStat;
    [Rarities.RARE]: MobStat;
    [Rarities.EPIC]: MobStat;
    [Rarities.LEGENDARY]: MobStat;
    [Rarities.MYTHIC]: MobStat;
    [Rarities.ULTRA]: MobStat;
    [Rarities.SUPER]: MobStat;
}

const MOB_SIZE_FACTOR: Record<Rarities, number> = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 1.2,
    [Rarities.RARE]: 1.5,
    [Rarities.EPIC]: 1.9,
    [Rarities.LEGENDARY]: 3.0,
    [Rarities.MYTHIC]: 5.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
};

const MOB_HEALTH_FACTOR: Record<Rarities, number> = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 2.5,
    [Rarities.RARE]: 6.3,
    [Rarities.EPIC]: 15.6,
    [Rarities.LEGENDARY]: 39.0,
    [Rarities.MYTHIC]: 100.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
};

const MOB_DAMAGE_FACTOR: Record<Rarities, number> = {
    [Rarities.COMMON]: 1.0,
    [Rarities.UNUSUAL]: 2.0,
    [Rarities.RARE]: 4.0,
    [Rarities.EPIC]: 8.0,
    [Rarities.LEGENDARY]: 16.0,
    [Rarities.MYTHIC]: 32.0,

    [Rarities.ULTRA]: 50,
    [Rarities.SUPER]: 100,
};

export { BaseMob, Mob, MobData, MobStat, MobInstance, MOB_SIZE_FACTOR, MOB_HEALTH_FACTOR, MOB_DAMAGE_FACTOR };