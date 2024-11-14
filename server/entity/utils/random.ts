import { ok } from "assert";
import { EntityPool } from "../EntityPool";

/**
 * Returns a random element from the given array.
 * @param choices - Array of items.
 * @returns One of the items in the array at random.
 */
export function choice<T>(choices: T[]): T {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

/**
 * Returns a true/false based on the percent chance.
 * @param percentChance - Percentage chance.
 */
export function chance(percentChance: number): boolean {
  return Math.random() < percentChance / 100;
}

/**
 * **Mutates the given array**
 * @param array - Array to shuffle.
 */
export function shuffle<T>(array: T[]): T[] {
  array.sort(() => Math.random() - 0.5);
  return array;
}

/**
 * Returns a random hexadecimal string.
 *
 * @example getRandomHexString(6) "CA96BF"
 * @param length - Length of random hex string.
 * @returns Random hex string.
 */
export function getRandomHexString(length: number) {
  return [...Array(length)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase();
}

/**
 * Returns a random string.
 */
export function getRandomString(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
}

/**
 * Generate a safe position from the player.
 * @returns Coordinate of random position.
 */
export function getRandomSafePosition(
    centerX: number,
    centerY: number,
    mapRadius: number,
    safetyDistance: number,
    entityPool: EntityPool
): [number, number] | null {
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
            return [x, y];
        }
    }

    return null;
}

export function getRandomAngle(): number {
    return Math.random() * 256;
}

export function generateRandomId(): number {
    return Math.random() * 2 ** 32 >>> 0;
}