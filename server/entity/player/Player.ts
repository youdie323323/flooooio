import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { Entity } from "../Entity";
import { EntityLinearMovement } from "../EntityLinearMovement";
import uWS from 'uWebSockets.js';
import { UserData } from "../EntityPool";
import { EntityChecksum } from "../EntityChecksum";
import { MobInstance } from "../mob/Mob";
import { PlayerPetalOrbit } from "./PlayerPetalOrbit";
import { PlayerReload } from "./PlayerReload";
import { MoodKind } from "../../../shared/mood";
import { PetalSlots, StaticPetalData } from "../mob/petal/Petal";

class BasePlayer implements Entity {
    readonly id: number;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;
    
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
     * Nickname of player.
     */
    nickname: string;
    
    /**
     * Petal slots, and cooldowns.
     */
    slots: PetalSlots & {
        cooldownsPetal: number[];
        cooldownsUsage: number[];
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
Player = EntityChecksum(Player);

type PlayerInstance = InstanceType<typeof Player>;

/**
 * Dummy data of {@link Player}.
 * 
 * @remarks
 * 
 * This data for visualize player in wave room.
 */
interface StaticPlayerData {
    name: string;
    slots: PetalSlots;

    /**
     * Websocket of player.
     */
    ws: uWS.WebSocket<UserData>;
}

export { Player, PlayerInstance, BasePlayer, StaticPlayerData };