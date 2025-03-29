import type { Circle } from "./Colliders/Collider";

export const PLAYER_MAX_COLLISION_DELTA = 15;

export function computeCirclePush(c0: Circle, c1: Circle): [number, number] | void {
    const dx = c1.x - c0.x;
    const dy = c1.y - c0.y;

    const distance = Math.hypot(dx, dy);

    // Calculate delta (overlap amount)
    const delta = c0.r + c1.r - distance;
    if (0 > delta) return;

    const nx = dx / distance;
    const ny = dy / distance;

    return [nx * delta, ny * delta];
}