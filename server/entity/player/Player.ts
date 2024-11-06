import { EntityCollisionResponse } from "../EntityCollisionResponse";
import { Entity } from "../Entity";
import { EntityLinearMovement } from "../EntityLinearMovement";
import uWS from 'uWebSockets.js';
import { UserData } from "../EntityPool";
import { EntityChecksum } from "../EntityChecksum";
import { MobInstance } from "../mob/Mob";
import { PlayerPetalOrbit } from "./PlayerPetalOrbit";
import { MoodKind } from "../../../shared/packet";

export class BasePlayer implements Entity {
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
        surface: (MobInstance | null)[];
        bottom: (MobInstance | null)[];
        cooldowns: number[];
    };

    ws: uWS.WebSocket<UserData>;
}

let Player = BasePlayer;
Player = EntityCollisionResponse(Player);
Player = EntityLinearMovement(Player);
// Do player mixin before checksum so petal reloads like original game (can interpolate movement)
Player = PlayerPetalOrbit(Player);
Player = EntityChecksum(Player);

type PlayerInstance = InstanceType<typeof Player>;

export { Player, PlayerInstance };