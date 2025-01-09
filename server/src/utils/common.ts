import { MobType, PetalType } from "../../../shared/EntityType";
import { ClientboundConnectionKickReason, ClientBound } from "../../../shared/packet";
import { PETAL_PROFILES } from "../../../shared/entity/mob/petal/petalProfiles";
import { Rarities } from "../../../shared/rarity";
import { memo } from "../../../shared/utils/memoize";
import { WaveRoomState } from "../../../shared/wave";
import { waveRoomService } from "../../main";
import { Entity } from "../entity/Entity";
import { MobStat, MobData, MOB_SIZE_FACTOR, MobInstance, Mob, BaseMob } from "../entity/mob/Mob";
import { PetalData, PetalStat, isLivingSlot } from "../entity/mob/petal/Petal";
import { BasePlayer, Player, PlayerId, PlayerInstance } from "../entity/player/Player";
import { UserData, WavePool } from "../wave/WavePool";
import WaveRoom, { WaveRoomPlayerId } from "../wave/WaveRoom";
import { choice, getRandomPosition } from "./random";
import uWS from 'uWebSockets.js';
import { calculateHp } from "./formula";
import { type } from "os";
import { MOB_PROFILES } from "../../../shared/entity/mob/mobProfiles";
import { PETAL_INITIAL_COOLDOWN } from "../entity/player/PlayerPetalReload";

const TAU = Math.PI * 2;

/**
 * Convert angle to radian.
 */
export const angleToRad = (angle: number): number => (angle / 255) * TAU;

export const isPetal = <(type: MobType | PetalType) => type is PetalType>memo((type: MobType | PetalType): type is PetalType => type in PETAL_PROFILES);

export const bodyDamageOrDamage = (stat: PetalStat | MobStat): number => "bodyDamage" in stat ? stat.bodyDamage : stat.damage;

export function clientRemove(waveRoom: WaveRoom, waveClientId: PlayerId) {
    const { wavePool } = waveRoom;

    removeAllBindings(wavePool, waveClientId);

    wavePool.removeClient(waveClientId);

    // Check size, if all players leaved, remove wave room
    // Maybe should do this in WavePool.removeClient?
    if (wavePool.clientPool.size === 0) {
        // This is not mistake, removeWaveRoom release wavePool memory too
        waveRoomService.removeWaveRoom(waveRoom);
    }
}

export function kickClient(ws: uWS.WebSocket<UserData>, reason: ClientboundConnectionKickReason) {
    const userData = ws.getUserData();
    if (userData) {
        const waveRoom = waveRoomService.findPlayerRoom(userData?.waveRoomClientId);

        // Remove them all
        if (waveRoom) {
            // In-game
            if (waveRoom.state !== WaveRoomState.WAITING && waveRoom?.wavePool && userData?.waveClientId) {
                clientRemove(waveRoom, userData.waveClientId)
            }

            // Lobby
            if (waveRoom.state === WaveRoomState.WAITING && userData?.waveRoomClientId) {
                waveRoom.removePlayer(userData.waveRoomClientId);
            }
        }
    };

    const buffer = Buffer.alloc(2);
    buffer.writeUInt8(ClientBound.CONNECTION_KICKED, 0);
    buffer.writeUInt8(reason, 1);

    ws.send(buffer, true);

    ws.close();
}

export function removeAllBindings(wavePool: WavePool, clientId: PlayerInstance["id"]) {
    const player = wavePool.getClient(clientId);
    if (player) {
        // Remove all petals
        player.slots.surface.forEach((petals) => {
            if (petals != null && isLivingSlot(petals)) {
                for (let i = 0; i < petals.length; i++) {
                    const e = petals[i];
                    if (wavePool.getMob(e.id)) {
                        wavePool.removeMob(e.id);
                    }
                }
            }
        });

        // Remove all their pets
        wavePool.getAllMobs().filter(c => c.petMaster === player).forEach((e) => {
            if (e != null && wavePool.getMob(e.id)) {
                wavePool.removeMob(e.id);
            };
        });

        // Reset all reloads
        player.slots.cooldownsPetal = Array.from({ length: player.slots.surface.length }, e => new Array(5).fill(PETAL_INITIAL_COOLDOWN));
        player.slots.cooldownsUsage = Array.from({ length: player.slots.surface.length }, e => new Array(5).fill(PETAL_INITIAL_COOLDOWN));
    }
}

export const processJoin = (ws: uWS.WebSocket<UserData>, id: false | WaveRoomPlayerId): Buffer => {
    const userData = ws.getUserData();
    if (!userData) return;

    const response = Buffer.alloc(id ? 5 : 1);
    response.writeUInt8(
        id ?
            ClientBound.WAVE_ROOM_SELF_ID :
            ClientBound.WAVE_ROOM_JOIN_FAILED,
        0,
    );

    if (id) {
        response.writeUInt32BE(id, 1);

        userData.waveRoomClientId = id;
    };

    ws.send(response, true);
}

export const calculateMobSize = (profile: MobData, rarity: Rarities): number => profile.baseSize * MOB_SIZE_FACTOR[rarity];

/**
 * Get first segment (head) of mob.
 * 
 * @privateremarks
 *
 * You may should care about maxium call stack size error.
 */
export const traverseMobSegments = (poolThis: WavePool, mob: MobInstance): MobInstance => {
    // Walk through segments
    const segment = mob.connectingSegment;
    if (segment && poolThis.getMob(segment.id)) {
        return traverseMobSegments(poolThis, segment);
    }

    return mob;
};

/**
 * Determine if mob is segment of body.
 */
export const isBody = (poolThis: WavePool, mob: MobInstance): boolean => traverseMobSegments(poolThis, mob) !== mob;

/**
 * Revive player nearby other player.
 */
export function revivePlayer(wavePool: WavePool, player: PlayerInstance) {
    if (player.isDead) {
        const alivePlayers = wavePool.getAllClients().filter(p => !p.isDead && p.id !== player.id);
        if (alivePlayers.length > 0) {
            // Select random player
            const randomAlivePlayer = choice(alivePlayers);

            const randPos = getRandomPosition(
                randomAlivePlayer.x,
                randomAlivePlayer.y,
                200,
            );

            // Make it max health so player will respawn without die again
            player.health = calculateMaxHealth(player);

            player.isDead = false;

            player.x = randPos[0];
            player.y = randPos[1];

            // Disable dead camera
            player.deadCameraTargetEntity = null;
        }
    }
}

/**
 * Determine if entity is dead.
 * 
 * @remarks
 * 
 * Note that the player is dead, not eliminated.
 */
export const isEntityDead = (poolThis: WavePool, entity: Entity): boolean => {
    return (
        // Player dead
        (entity instanceof Player && entity.isDead) ||
        // Mob dead
        (entity instanceof Mob && !poolThis.getMob(entity.id))
    )
}

/**
 * Calculate maxHealth by entity instance.
 */
export function calculateMaxHealth(entity: Entity): number {
    if (entity instanceof BaseMob) {
        const profile: MobData | PetalData = MOB_PROFILES[entity.type] || PETAL_PROFILES[entity.type];

        return profile[entity.rarity].health;
    } else {
        return calculateHp(100);
    }
}