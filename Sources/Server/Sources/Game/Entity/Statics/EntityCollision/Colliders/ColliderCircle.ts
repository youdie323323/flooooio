import { AbstractCollider } from "./Collider";
import type { Circle, Point } from "./Collider";

export default class ColliderCircle extends AbstractCollider<Circle> {
    public computeDelta(c0: Circle, c1: Circle): number {
        // Calculate distance between circle centers
        const dx = c1.x - c0.x;
        const dy = c1.y - c0.y;
        const distance = Math.hypot(dx, dy);

        // Calculate delta (overlap amount)
        // δ = r0 + r1 - d
        // Positive delta means collision/overlap
        // Negative delta means no collision/separation
        const delta = c0.r + c1.r - distance;

        return delta;
    }
}
