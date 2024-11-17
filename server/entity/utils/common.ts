import crypto from "crypto";
import { MobType, PetalType } from "../../../shared/types";
import { PlayerInstance } from "../player/Player";
import { EntityPool } from "../EntityPool";
import { Mob, MobStat } from "../mob/Mob";
import { isLivingPetal, PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import WaveRoomService from "../../wave/WaveRoomService";
import WaveRoom, { WaveRoomState } from "../../wave/WaveRoom";
import { waveRoomService } from "../../main";

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
        removeAllBindings(waveRoom.entityPool, player);

        waveRoom.entityPool.removeClient(player.id);

        // Check size, if all players leaved, remove wave room
        if (waveRoom.state !== WaveRoomState.WAITING && waveRoom.entityPool.clients.size === 0) {
            waveRoomService.removeWaveRoom(waveRoom);
        }
    }
}

export function removeAllBindings(entityPool: EntityPool, player: PlayerInstance) {
    if (player) {
        // Remove all petals
        player.slots.surface.forEach((e) => {
            if (e != null && isLivingPetal(e) && entityPool.getMob(e.id)) {
                entityPool.removeMob(e.id);
            }
        });

        // Remove all their pets
        entityPool.getAllMobs().filter(c => c.petParentPlayer === player).forEach((e) => {
            if (e != null && isLivingPetal(e) && entityPool.getMob(e.id)) {
                entityPool.removeMob(e.id);
            };
        });

        // Reset all reloads
        player.slots.cooldownsPetal = new Array(player.slots.surface.length).fill(0);
        player.slots.cooldownsUsage = new Array(player.slots.surface.length).fill(0);
    }
}