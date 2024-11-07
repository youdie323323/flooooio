import crypto from "crypto";
import { MobType, PetalType } from "../../../shared/types";
import { PlayerInstance } from "../player/Player";
import { EntityPool } from "../EntityPool";
import { Mob, MobStat } from "../mob/Mob";
import { PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";

export function generateId(): number {
    return Math.random() * 2 ** 32 >>> 0;
}

export function angleToRad(angle: number): number {
    return (angle / 255) * Math.PI * 2
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

export function getRandomMapPos(): { x: number, y: number } {
    return {
        x: Math.floor(Math.random() * (10468 + 1)),
        y: Math.floor(Math.random() * (10168 + 1))
    };
}

// Its can called 2 times for client; onclose and ondeath
export function onPlayerDead(poolThis: EntityPool, player: PlayerInstance, isConnectionLost = false) {
    // Its throws error when using instanceof
    if (player /* player instanceof Player */) {
        // Delete all petals
        player.slots.surface.forEach((e) => {
            if (e instanceof Mob) {
                poolThis.removeMob(e.id);
            }
        });
        if (isConnectionLost) {
            poolThis.removeClient(player.id);
        } else {
            player.isDead = true;
            // Stop moving
            player.magnitude = 0;
        }
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