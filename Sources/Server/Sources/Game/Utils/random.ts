import { ok } from "assert";
import { MobId } from "../Entity/Dynamics/Mob/Mob";
import { PlayerInstance, PlayerId } from "../Entity/Dynamics/Player/Player";
import { WaveRoomPlayerId } from "../Genres/Wave/WaveRoom";

const TAU = Math.PI * 2;

/**
 * Returns a random element from the given array.
 * 
 * @param choices - Array of items
 * @returns One of the items in the array at random
 */
export function choice<T>(choices: Array<T> | ReadonlyArray<T>): T {
    const index = Math.floor(Math.random() * choices.length);

    return choices[index];
}

/**
 * Returns a true/false based on the percent chance.
 * 
 * @param percentChance - Percentage chance
 */
export function chance(percentChance: number): boolean {
    return Math.random() < percentChance / 100;
}

export function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function getRandomInteger(min: number, max: number) {
    return Math.floor(getRandom(min, max));
}

export function splitIntoChunks(str: string, size: number) {
    ok(typeof str === "string", "str must be typeof string");
    ok(typeof size === "number", "size must be typeof number");
    ok(Math.floor(size) === size, "size must be integer");

    const numChunks = Math.ceil(str.length / size);
    const chunks: string[] = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size);
    }

    return chunks;
}

export function randomEnum<T extends object>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];

    return randomEnumValue;
}

/**
 * Generate a safe position from the player.
 * @returns Coordinate of random position.
 */
export function getRandomSafePosition(
    mapRadius: number,
    safetyDistance: number,
    clients: PlayerInstance[],
): [number, number] | null {
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
        const angle = Math.random() * TAU;
        const distance = Math.random() * (mapRadius - safetyDistance);

        const x = mapRadius + Math.cos(angle) * distance;
        const y = mapRadius + Math.sin(angle) * distance;

        let isSafe = true;

        // Dont spawn on player
        clients.forEach(client => {
            const dx = client.x - x;
            const dy = client.y - y;
            const distanceToClient = Math.sqrt(dx * dx + dy * dy);
            if (distanceToClient < safetyDistance + client.size) {
                isSafe = false;
            }
        });

        if (isSafe) {
            return [x, y];
        }
    }

    return null;
}

/**
 * Generate a position.
 * @returns Coordinate of random position.
 */
export function getRandomPosition(
    centerX: number,
    centerY: number,
    spawnRadius: number,
): [number, number] {
    const angle = Math.random() * TAU;
    const distance = (0.5 + Math.random() * 0.5) * spawnRadius;

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    return [x, y];
}

export function getRandomAngle(): number {
    return Math.random() * 256;
}

function randomUint32(): number {
    return Math.random() * 2 ** 32 >>> 0;
}

export function generateRandomId<T extends MobId | PlayerId | WaveRoomPlayerId>(): T {
    return randomUint32() as T;
}