import uWS from 'uWebSockets.js';
import { choice, getRandomPosition } from './random';
import { memo } from '../../../../Shared/Utils/Memoize';
import { WaveRoomState } from '../../../../Shared/WaveRoom';
import { waveRoomService } from '../../../Main';
import { Rarity } from '../../../../Shared/Entity/Statics/EntityRarity';
import { MobType, PetalType } from '../../../../Shared/Entity/Statics/EntityType';
import { MobStat, MobData } from '../../../../Shared/Entity/Statics/Mob/MobData';
import { MOB_PROFILES } from '../../../../Shared/Entity/Statics/Mob/MobProfiles';
import { PetalStat, PetalData } from '../../../../Shared/Entity/Statics/Mob/Petal/PetalData';
import { PETAL_PROFILES } from '../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles';
import { Entity } from '../Entity/Dynamics/Entity';
import { MOB_SIZE_FACTOR, MobInstance, Mob, BaseMob } from '../Entity/Dynamics/Mob/Mob';
import { isDynamicPetal, MAX_CLUSTER_AMOUNT } from '../Entity/Dynamics/Mob/Petal/Petal';
import { PlayerId, PlayerInstance, Player } from '../Entity/Dynamics/Player/Player';
import { PETAL_INITIAL_COOLDOWN } from '../Entity/Dynamics/Player/PlayerPetalReload';
import { calculateHp } from '../Genres/Wave/Mathematics/WaveFormula';
import { UserData, WavePool } from '../Genres/Wave/WavePool';
import WaveRoom, { WaveRoomPlayerId } from '../Genres/Wave/WaveRoom';
import { ClientBound } from '../../../../Shared/Packet/Bound/Client/ClientBound';
import { ClientboundConnectionKickReason } from '../../../../Shared/Packet/Bound/Client/ClientboundConnectionKickReason';

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
            if (waveRoom.state !== WaveRoomState.Waiting && waveRoom?.wavePool && userData?.waveClientId) {
                clientRemove(waveRoom, userData.waveClientId);
            }

            // Lobby
            if (waveRoom.state === WaveRoomState.Waiting && userData?.waveRoomClientId) {
                waveRoom.removePlayer(userData.waveRoomClientId);
            }
        }
    }

    const buffer = Buffer.alloc(2);
    buffer.writeUInt8(ClientBound.ConnectionKicked, 0);
    buffer.writeUInt8(reason, 1);

    ws.send(buffer, true);

    ws.close();
}

export function removeAllBindings(wavePool: WavePool, clientId: PlayerInstance["id"]) {
    const player = wavePool.getClient(clientId);
    if (player) {
        // Remove all petals
        player.slots.surface.forEach((petals) => {
            if (petals != null && isDynamicPetal(petals)) {
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
            }
        });

        // Reset all reloads
        player.slots.cooldownsPetal = Array.from({ length: player.slots.surface.length }, e => new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN));
        player.slots.cooldownsUsage = Array.from({ length: player.slots.surface.length }, e => new Array(MAX_CLUSTER_AMOUNT).fill(PETAL_INITIAL_COOLDOWN));
    }
}

export const processJoin = (ws: uWS.WebSocket<UserData>, id: false | WaveRoomPlayerId): Buffer => {
    const userData = ws.getUserData();
    if (!userData) return;

    const response = Buffer.alloc(id ? 5 : 1);
    response.writeUInt8(
        id ?
            ClientBound.WaveRoomSelfId :
            ClientBound.WaveRoomJoinFailed,
        0,
    );

    if (id) {
        response.writeUInt32BE(id, 1);

        userData.waveRoomClientId = id;
    }

    ws.send(response, true);
};

export const calculateMobSize = (profile: MobData, rarity: Rarity): number => profile.baseSize * MOB_SIZE_FACTOR[rarity];

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
export const isDeadEntity = (poolThis: WavePool, entity: Entity): boolean => {
    return (
        // Player dead
        (entity instanceof Player && entity.isDead) ||
        // Mob dead
        (entity instanceof Mob && !poolThis.getMob(entity.id))
    );
};

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