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
import { StaticPetalData } from "../mob/petal/Petal";

export type MaybeEmptySlot<T> = T | null;

class BasePlayer implements Entity {
    id: number;
    x: number;
    y: number;
    magnitude: number;
    angle: number;
    size: number;
    health: number;
    maxHealth: number;
    bodyDamage: number;
    mood: MoodKind;
    isDead: boolean;
    nickname: string;
    slots: {
        surface: MaybeEmptySlot<MobInstance>[];
        bottom: MaybeEmptySlot<MobInstance>[];
        cooldownsPetal: number[];
        cooldownsUsage: number[];
    };

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

interface PlayerData {
    name: string;
    // Static slots (for visualize, converting)
    slots: {
        surface: MaybeEmptySlot<StaticPetalData>[];
        bottom: MaybeEmptySlot<StaticPetalData>[];
    };
    ws: uWS.WebSocket<UserData>;
}

export { Player, PlayerInstance, BasePlayer, PlayerData };