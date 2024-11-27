import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { UserData, WavePool } from "../wave/WavePool";
import { MobInstance, MobStat } from "../entity/mob/Mob";
import { PetalStat, isSpawnableSlot } from "../entity/mob/petal/Petal";
import { PlayerInstance } from "../entity/player/Player";
import { waveRoomService } from "../main";
import WaveRoom, { WaveRoomState } from "../wave/WaveRoom";
import { Entity, EntityId } from "../entity/Entity";
import { choice, getRandomPosition } from "./random";
import { MobType, PetalType } from "../../shared/enum";
import { ClientBound, ClientboundConnectionKickReason } from "../../shared/packet";
import uWS from 'uWebSockets.js';

export const TWO_PI = Math.PI * 2;

export function angleToRad(angle: number): number {
    return (angle / 255) * TWO_PI
}

export function isPetal(type: MobType | PetalType): type is PetalType {
    return type in PETAL_PROFILES;
}

export function bodyDamageOrDamage(stat: PetalStat | MobStat): number {
    return "bodyDamage" in stat ? stat.bodyDamage : stat.damage;
}

export function clientRemove(waveRoom: WaveRoom, waveClientId: EntityId) {
    removeAllBindings(waveRoom.wavePool, waveClientId);

    waveRoom.wavePool.removeClient(waveClientId);

    // Check size, if all players leaved, remove wave room
    // Maybe should do this in WavePool.removeClient?
    if (waveRoom.wavePool.clients.size === 0) {
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
}

export function removeAllBindings(wavePool: WavePool, clientId: PlayerInstance["id"]) {
    const player = wavePool.getClient(clientId);
    if (player) {
        // Remove all petals
        player.slots.surface.forEach((petals) => {
            if (petals != null && isSpawnableSlot(petals)) {
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
        player.slots.cooldownsPetal = Array.from({ length: player.slots.surface.length }, e => new Array(5).fill(0));
        player.slots.cooldownsUsage = Array.from({ length: player.slots.surface.length }, e => new Array(5).fill(0));
    }
}