import { EntityCollision } from "../EntityCollision";
import type { BrandedId, Entity, PartialUnion, UnderlyingMixinUnion } from "../Entity";
import { ON_UPDATE_TICK } from "../Entity";
import { EntityCoordinateMovement } from "../EntityCoordinateMovement";
import type uWS from 'uWebSockets.js';
import { PlayerPetalOrbit } from "./PlayerPetalOrbit";
import { PlayerPetalReload } from "./PlayerPetalReload";
import type { PetalSlots } from "../Mob/Petal/Petal";
import { PlayerDeadCamera } from "./PlayerDeadCamera";
import { EntityCoordinateBoundary } from "../EntityCoordinateBoundary";
import { EntityElimination } from "../EntityElimination";
import type { UserData, WavePool } from "../../../Genres/Wave/WavePool";
import { PlayerPetalConsume } from "./PlayerPetalConsume";

export type PlayerId = BrandedId<"Player">;

class BasePlayer implements Entity {
    /**
     * Base speed of player.
     */
    public static readonly BASE_SPEED = 5;

    /**
     * Base size of player.
     */
    public static readonly BASE_SIZE = 15;

    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;

    /**
     * Id of player.
     * 
     * @readonly
     */
    readonly id: PlayerId;

    /**
     * Body damage of player.
     */
    bodyDamage: number;

    /**
     * Bit-flaged current mood of player.
     */
    mood: number;

    /**
     * Determine if player is dead.
     * 
     * @remarks
     * The reason this property in the player and not in the mob is to revive the player with Yggdrasil, etc.
     * When a mob dies, instantly removed from the pool.
     */
    isDead: boolean;

    /**
     * Target entity where dead player seeing.
     */
    deadCameraTargetEntity: Entity | null;

    /**
     * Avoid all collisions & boundaries.
     */
    noclip: boolean;

    /**
     * Nickname of player.
     * 
     * @readonly
     */
    readonly nickname: string;

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

    /**
     * Player is developer flower or not.
     */
    isDev: boolean;

    constructor(
        source: PartialUnion<
            BasePlayer,
            | UnderlyingMixinUnion
            | "isCollidable"
        >,
    ) {
        Object.assign(this, source);
    }

    // Underlying EntityMixinTemplate to prevent error

    [ON_UPDATE_TICK](poolThis: WavePool): void { }

    [Symbol.dispose](): void { }

    /**
     * Determine if player is collidable to any collidables.
     * 
     * @remarks
     * Using isDead here could allow users to cross the boundary.
     */
    get isCollidable(): boolean {
        return !this.noclip;
    }
}

let Player = BasePlayer;

// Do PlayerPetalOrbit before PlayerReload so petal reloads like original game (can interpolate movement)
Player = PlayerPetalOrbit(Player);
Player = PlayerPetalReload(Player);
Player = PlayerPetalConsume(Player);
Player = PlayerDeadCamera(Player);

Player = EntityCollision(Player);
Player = EntityElimination(Player);
Player = EntityCoordinateBoundary(Player);
Player = EntityCoordinateMovement(Player);

type PlayerInstance = InstanceType<typeof Player>;

/**
 * Dummy data of {@link Player}.
 * 
 * @remarks
 * This data for visualize player in wave room.
 */
interface StaticPlayer {
    name: string;
    
    slots: PetalSlots;

    /**
     * Websocket of player.
     */
    ws: uWS.WebSocket<UserData>;
}

export type { PlayerInstance, StaticPlayer };
export { Player, BasePlayer };