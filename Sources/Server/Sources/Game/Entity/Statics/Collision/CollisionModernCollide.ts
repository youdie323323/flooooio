import type { Circle } from "./Colliders/Collider";

export const PLAYER_MAX_COLLISION_DELTA = 15;

export function computeCircleDelta(c0: Circle, c1: Circle): [number, number] {
    const dx = c1.x - c0.x;
    const dy = c1.y - c0.y;
    const distance = Math.hypot(dx, dy);

    // Calculate delta (overlap amount)
    const delta = c0.r + c1.r - distance;

    return [delta, distance];
}

export function isColliding(delta: number): boolean {
    return delta > 0;
}