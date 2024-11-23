import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { BrandedId, Entity, EntityId } from "../Entity";
import { EntityLinearMovement } from "../EntityLinearMovement";
import uWS from 'uWebSockets.js';
import { UserData } from "../../wave/WavePool";
import { MobInstance } from "../mob/Mob";
import { PlayerPetalOrbit } from "./PlayerPetalOrbit";
import { PlayerReload } from "./PlayerPetalReload";
import { MoodKind } from "../../../shared/mood";
import { PetalSlots, MockPetalData } from "../mob/petal/Petal";
import { PlayerDeadCamera } from "./PlayerDeadCamera";
import { EntityWorldBoundary } from "../EntityWorldBoundary";
import { EntityDeath } from "../EntityDeath";
import { PlayerPetalConsume } from "./PlayerPetalConsume";

class BasePlayer implements Entity {
    readonly id: EntityId;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    readonly maxHealth: number;

    /**
     * Body damage of player.
     * 
     * @remarks
     * 
     * We have this property because body damage is mutable by petal.
     */
    bodyDamage: number;

    /**
     * Current mood of player.
     */
    mood: MoodKind;

    /**
     * Determine if player is dead.
     * 
     * @remarks
     * 
     * The reason this property in the player and not in the mob is to revive the player with Yggdrasil, etc.
     * When a mob dies, instantly removed from the pool.
     */
    isDead: boolean;

    /**
     * Target entity where dead player seeing.
     */
    playerDeadCameraTargetEntity: Entity | null;

    /**
     * Nickname of player.
     */
    nickname: string;

    /**
     * Petal slots, and cooldowns.
     */
    slots: PetalSlots & {
        cooldownsPetal: number[][];
        cooldownsUsage: number[][];
    };

    /**
     * Websocket of player.
     */
    ws: uWS.WebSocket<UserData>;

    constructor(source: Required<BasePlayer>) {
        Object.assign(this, source);
    }
}

let Player = BasePlayer;
Player = EntityCollisionResponse(Player);
Player = EntityLinearMovement(Player);
// Do player mixin before checksum so petal reloads like original game (can interpolate movement)
Player = PlayerPetalOrbit(Player);
Player = PlayerReload(Player);
Player = EntityDeath(Player);
Player = EntityWorldBoundary(Player);
Player = PlayerDeadCamera(Player);
Player = PlayerPetalConsume(Player);

type PlayerInstance = InstanceType<typeof Player>;

/**
 * Dummy data of {@link Player}.
 * 
 * @remarks
 * 
 * This data for visualize player in wave room.
 */
interface MockPlayerData {
    name: string;
    slots: PetalSlots;

    /**
     * Websocket of player.
     */
    ws: uWS.WebSocket<UserData>;
}

export { Player, PlayerInstance, BasePlayer, MockPlayerData };