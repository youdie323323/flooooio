import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { BrandedId, Entity, ConstructorParameterObject, PartialUnion } from "../Entity";
import { EntityLinearMovement } from "../EntityLinearMovement";
import uWS from 'uWebSockets.js';
import { UserData } from "../../wave/WavePool";
import { MobInstance } from "../mob/Mob";
import { PlayerPetalOrbit } from "./PlayerPetalOrbit";
import { PlayerPetalReload } from "./PlayerPetalReload";
import { PetalSlots, MockPetalData } from "../mob/petal/Petal";
import { PlayerDeadCamera } from "./PlayerDeadCamera";
import { EntityMapBoundary } from "../EntityMapBoundary";
import { EntityDeath } from "../EntityDeath";
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
    maxHealth: number;

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

    constructor(
        source: PartialUnion<
            BasePlayer,
            // Partial getters
            "isCollidable"
        >
    ) {
        Object.assign(this, source);
    }

    /**
     * Determine if player is collidable to any collidables.
     * 
     * @remarks
     * 
     * Using isDead here could allow users to cross the boundary.
     */
    get isCollidable(): boolean {
        return !this.noclip;
    }
}

let Player = BasePlayer;

// Do PlayerPetalConsume before PlayerReload to avoid server crash
Player = PlayerPetalConsume(Player);
// Do PlayerPetalOrbit before PlayerReload so petal reloads like original game (can interpolate movement)
Player = PlayerPetalOrbit(Player);
Player = PlayerPetalReload(Player);
Player = PlayerDeadCamera(Player);

Player = EntityCollisionResponse(Player);
Player = EntityDeath(Player);
Player = EntityMapBoundary(Player);
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