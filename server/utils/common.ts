import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { MobType, PetalType } from "../../shared/types";
import { EntityPool } from "../entity/EntityPool";
import { MobInstance, MobStat } from "../entity/mob/Mob";
import { PetalStat, isSpawnableSlot } from "../entity/mob/petal/Petal";
import { PlayerInstance } from "../entity/player/Player";
import { waveRoomService } from "../main";
import WaveRoom, { WaveRoomState } from "../wave/WaveRoom";
import { Entity } from "../entity/Entity";
import { MAP_CENTER_X, MAP_CENTER_Y } from "../entity/EntityChecksum";
import { choice, getRandomSafePosition } from "./random";

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

export function removeAllSlotPetals(entityPool: EntityPool, petals: MobInstance[]) {
    for (let i = 0; i < petals.length; i++) {
        const e = petals[i];
        if (entityPool.getMob(e.id)) {
            entityPool.removeMob(e.id);
        }
    }
}

export function removeAllBindings(entityPool: EntityPool, player: PlayerInstance) {
    if (player) {
        // Remove all petals
        player.slots.surface.forEach((e) => {
            if (e != null && isSpawnableSlot(e)) {
                removeAllSlotPetals(entityPool, e);
            }
        });

        // Remove all their pets
        entityPool.getAllMobs().filter(c => c.petParentPlayer === player).forEach((e) => {
            if (e != null && entityPool.getMob(e.id)) {
                entityPool.removeMob(e.id);
            };
        });

        // Reset all reloads
        player.slots.cooldownsPetal = new Array(player.slots.surface.length).fill(0);
        player.slots.cooldownsUsage = new Array(player.slots.surface.length).fill(0);
    }
}