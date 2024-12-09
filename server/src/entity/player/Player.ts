import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { BrandedId, Entity, EntityId } from "../Entity";
import { EntityLinearMovement } from "../EntityLinearMovement";
import uWS from 'uWebSockets.js';
import { UserData } from "../../wave/WavePool";
import { MobInstance } from "../mob/Mob";
import { PlayerPetalOrbit } from "./PlayerPetalOrbit";
import { PlayerReload } from "./PlayerPetalReload";
import { PetalSlots, MockPetalData } from "../mob/petal/Petal";
import { PlayerDeadCamera } from "./PlayerDeadCamera";
import { EntityMapBoundary } from "../EntityMapBoundary";
import { EntityDeath } from "../EntityDeath";
import { PlayerPetalConsume } from "./PlayerPetalConsume";
import { Mood } from "../../../../shared/enum";

class BasePlayer implements Entity {
    /**
     * Base speed of player.
     */
    public static readonly BASE_SPEED = 5;

    readonly id: EntityId;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;

    /**
     * Nickname of player.
     * 
     * @readonly
     */
    readonly nickname: string;

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
    mood: Mood;

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
    deadCameraTargetEntity: Entity | null;

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
// Do PlayerPetalOrbit before PlayerReload so petal reloads like original game (can interpolate movement)
Player = PlayerPetalOrbit(Player);
// Place PlayerPetalConsume before PlayerReload to avoid server crash
Player = PlayerPetalConsume(Player);
Player = PlayerReload(Player);
Player = PlayerDeadCamera(Player);

Player = EntityDeath(Player);
Player = EntityMapBoundary(Player);
Player = EntityCollisionResponse(Player);
Player = EntityLinearMovement(Player);

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