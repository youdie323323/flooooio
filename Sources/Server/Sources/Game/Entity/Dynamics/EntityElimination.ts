import type { MobData } from "../../../../../Shared/Entity/Statics/Mob/MobData";
import type { PetalData } from "../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import { WaveRoomState } from "../../../../../Shared/WaveRoom";
import BinarySizedWriter from "../../../../../Shared/Websocket/Binary/ReadWriter/Writer/BinarySizedWriter";
import { Clientbound, type ClientboundConnectionKickReason } from "../../../../../Shared/Websocket/Packet/PacketDirection";
import { waveRoomService } from "../../../../Main";
import type { UserData, WavePool } from "../../Genres/Wave/WavePool";
import type WaveRoom from "../../Genres/Wave/WaveRoom";
import type { EntityMixinConstructor, Entity, EntityMixinTemplate} from "./Entity";
import { ON_UPDATE_TICK } from "./Entity";
import { getRandomCoordinate } from "./EntityCoordinateMovement";
import { BaseMob, Mob } from "./Mob/Mob";
import { isDynamicPetal, MAX_CLUSTER_AMOUNT } from "./Mob/Petal/Petal";
import type { PlayerId, PlayerInstance } from "./Player/Player";
import { Player } from "./Player/Player";
import { PETAL_INITIAL_COOLDOWN } from "./Player/PlayerPetalReload";
import type uWS from 'uWebSockets.js';
import MOB_PROFILES from "../../../../../Shared/Native/mob_profiles.json";
import PETAL_PROFILES from "../../../../../Shared/Native/petal_profiles.json";

/**
 * Calculate hp by level.
 * 
 * @remarks
 * 100 * x, x is upgrade.
 */
export const calculateHp = (level: number): number => (100 * 2000) * 1.02 ** (Math.max(level, 75) - 1);

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

/**
 * Determine if entity is dead.
 * 
 * @remarks
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
 * Revive player nearby other player.
 */
export function revivePlayer(wavePool: WavePool, player: PlayerInstance) {
    if (player.isDead) {
        const alivePlayers = wavePool.getAllClients().filter(p => !p.isDead && p.id !== player.id);

        if (alivePlayers.length > 0) {
            // Select random player
            const randomAlivePlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

            const randPos = getRandomCoordinate(
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

export function removeAllBindings(wavePool: WavePool, clientId: PlayerId) {
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

export function removeClientFromAllService(waveRoom: WaveRoom, waveClientId: PlayerId) {
    const { wavePool } = waveRoom;

    // Wave
    {
        removeAllBindings(wavePool, waveClientId);

        wavePool.removeClient(waveClientId);
    }

    // Wave room
    {
        // Check size, if all players leaved, remove wave room
        // Maybe should do this in WavePool.removePlayer?
        if (wavePool.clientPool.size === 0) {
            // This is not mistake, removeWaveRoom release wavePool memory too
            waveRoomService.removeWaveRoom(waveRoom);
        }
    }
}

export function kickClient(ws: uWS.WebSocket<UserData>, reason: ClientboundConnectionKickReason) {
    const userData = ws.getUserData();
    if (userData) {
        const waveRoom = waveRoomService.findPlayerRoom(userData?.waveRoomClientId);

        if (waveRoom) {
            // Wave
            if (waveRoom.state !== WaveRoomState.WAITING && waveRoom?.wavePool && userData?.waveClientId) {
                removeClientFromAllService(waveRoom, userData.waveClientId);
            }

            // Wave room
            if (waveRoom.state === WaveRoomState.WAITING && userData?.waveRoomClientId) {
                waveRoom.unregisterPlayer(userData.waveRoomClientId);
            }
        }
    }

    const connectionKickedWriter = new BinarySizedWriter(2);

    connectionKickedWriter.writeUInt8(Clientbound.CONNECTION_KICKED);

    connectionKickedWriter.writeUInt8(reason);

    ws.send(connectionKickedWriter.buffer, true);

    ws.close();
}

export function EntityElimination<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [ON_UPDATE_TICK](poolThis: WavePool): void {
            super[ON_UPDATE_TICK](poolThis);

            if (
                !isDeadEntity(poolThis, this) &&
                0 >= this.health
            ) {
                if (this instanceof Player) {
                    this.isDead = true;

                    this.health = 0;

                    // Stop moving
                    this.magnitude = 0;

                    removeAllBindings(poolThis, this.id);

                    return;
                }

                if (this instanceof Mob) {
                    poolThis.removeMob(this.id);

                    return;
                }
            }
        }
    };
}