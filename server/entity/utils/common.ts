import crypto from "crypto";
import { MobType, PetalType } from "../../../shared/types";
import { PlayerInstance } from "../player/Player";
import { EntityPool } from "../EntityPool";
import { Mob, MobStat } from "../mob/Mob";
import { isLivingPetal, PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import WaveRoomService from "../../wave/WaveRoomService";
import WaveRoom from "../../wave/WaveRoom";

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
        // Use onChangeSomething so can delete started wave if all players leaved
        using _disposable = waveRoom.onChangeAnything();

        removeAllBindings(waveRoom, player);

        waveRoom.entityPool.removeClient(player.id);
    }
}

export function removeAllBindings(waveRoom: WaveRoom, player: PlayerInstance) {
    if (player) {
        // Remove all petals
        player.slots.surface.forEach((e) => {
            if (e != null && isLivingPetal(e) && waveRoom.entityPool.getMob(e.id)) {
                waveRoom.entityPool.removeMob(e.id);
            }
        });

        // Remove all their pets
        waveRoom.entityPool.getAllMobs().filter(c => c.petParentPlayer === player).forEach((e) => {
            if (e != null && isLivingPetal(e) && waveRoom.entityPool.getMob(e.id)) {
                waveRoom.entityPool.removeMob(e.id);
            }
        });

        // Reset all reloads
        player.slots.cooldownsPetal = new Array(player.slots.surface.length).fill(0);
        player.slots.cooldownsUsage = new Array(player.slots.surface.length).fill(0);
    }
}