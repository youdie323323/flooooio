import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { WavePool } from "../wave/WavePool";
import { MobInstance, MobStat } from "../entity/mob/Mob";
import { PetalStat, isSpawnableSlot } from "../entity/mob/petal/Petal";
import { PlayerInstance } from "../entity/player/Player";
import { waveRoomService } from "../main";
import WaveRoom, { WaveRoomState } from "../wave/WaveRoom";
import { Entity } from "../entity/Entity";
import { choice, getRandomPosition } from "./random";
import { MobType, PetalType } from "../../shared/enum";

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

export function kickClient(waveRoom: WaveRoom, player: PlayerInstance) {
    if (player) {
        removeAllBindings(waveRoom.wavePool, player);

        waveRoom.wavePool.removeClient(player.id);

        // Check size, if all players leaved, remove wave room
        if (waveRoom.state !== WaveRoomState.WAITING && waveRoom.wavePool.clients.size === 0) {
            waveRoomService.removeWaveRoom(waveRoom);
        }
    }
}

export function removeAllBindings(wavePool: WavePool, player: PlayerInstance) {
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