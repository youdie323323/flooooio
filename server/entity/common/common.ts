import crypto from "crypto";
import { MobType, PetalType } from "../../../shared/types";
import { PlayerInstance } from "../player/Player";
import { EntityPool } from "../EntityPool";
import { Mob, MobStat } from "../mob/Mob";
import { PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import WaveRoomManager from "../../wave/WaveRoomManager";
import WaveRoom from "../../wave/WaveRoom";

export function generateId(): number {
    return Math.random() * 2 ** 32 >>> 0;
}

export const TWO_PI = Math.PI * 2;
export function angleToRad(angle: number): number {
    return (angle / 255) * TWO_PI
}

export function getRandomAngle(): number {
    return Math.random() * 256;
}

export function isPetal(type: MobType | PetalType): boolean {
    return type in PETAL_PROFILES;
}

export function bodyDamageOrDamage(c: PetalStat | MobStat): string {
    return "bodyDamage" in c ? "bodyDamage" : "damage";
}

export function onClientDeath(poolThis: EntityPool, player: PlayerInstance) {
    if (player) {
        // Delete all petals
        player.slots.surface.forEach((e) => {
            if (e instanceof Mob) {
                poolThis.removeMob(e.id);
            }
        });

        player.isDead = true;
        // Stop moving
        player.magnitude = 0;
    }
}

export function kickClient(waveRoom: WaveRoom, player: PlayerInstance) {
    if (player) {
        // Use onChangeSomething so can delete started wave if all players leaved
        using _disposable = waveRoom.onChangeAnything();

        // Delete all petals
        player.slots.surface.forEach((e) => {
            if (e instanceof Mob) {
                waveRoom.entityPool.removeMob(e.id);
            }
        });

        waveRoom.entityPool.removeClient(player.id);
    }
}

export function randomEnum<T extends object>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
}

export function choice<T>(arr: Array<T>): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function getRandomSafePosition(
    centerX: number,
    centerY: number,
    mapRadius: number,
    safetyDistance: number,
    entityPool: EntityPool
): { x: number; y: number } | null {
    const maxAttempts = 100;

    mapRadius = Math.min(centerX, centerY) - mapRadius;

    for (let i = 0; i < maxAttempts; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (mapRadius - safetyDistance);

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        let isSafe = true;

        // Dont spawn on player
        entityPool.getAllClients().forEach(client => {
            const dx = client.x - x;
            const dy = client.y - y;
            const distanceToClient = Math.sqrt(dx * dx + dy * dy);
            if (distanceToClient < safetyDistance + client.size) {
                isSafe = false;
            }
        });

        if (isSafe) {
            return { x, y };
        }
    }

    return null;
}