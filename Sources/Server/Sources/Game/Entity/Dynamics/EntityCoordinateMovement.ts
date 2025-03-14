import type { WavePool } from "../../Genres/Wave/WavePool";
import type { EntityMixinConstructor, Entity, EntityMixinTemplate} from "./Entity";
import { onUpdateTick } from "./Entity";
import type { PlayerInstance } from "./Player/Player";

const TAU = Math.PI * 2;

/**
 * Convert angle to radian.
 */
export const angleToRad = (angle: number): number => (angle / 255) * TAU;

export function EntityCoordinateMovement<T extends EntityMixinConstructor<Entity>>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            if (this.magnitude > 0) {
                const rad = angleToRad(this.angle);
                const magnitude = this.magnitude / 255;
                
                this.x += Math.cos(rad) * magnitude;
                this.y += Math.sin(rad) * magnitude;
            }
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }
        }
    };
}

/**
 * Generate a random safe position.
 * 
 * @returns Safe random coordinate.
 */
export function getRandomSafeCoordinate(
    mapRadius: number,
    safetyDistance: number,
    clients: PlayerInstance[],
): [number, number] | null {
    const MAX_ATTEMPTS = 100;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
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
 * Generate a random position.
 * 
 * @returns Random coordinate.
 */
export function getRandomCoordinate(
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