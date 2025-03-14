export interface Point {
    x: number;
    y: number;
}

export interface Circle {
    x: number;
    y: number;
    r: number;
}

export interface Ellipse {
    a: number;
    b: number;
    x: number;
    y: number;
    theta: number;
}

export interface Evolute extends Point {
    r: number;
}

export type CollidableShapes = Circle | Ellipse;

export function isCircle(s0: CollidableShapes): s0 is Circle {
    return "r" in s0;
}

export function isEllipse(s0: CollidableShapes): s0 is Ellipse {
    return "theta" in s0;
}

export abstract class AbstractCollider<T extends CollidableShapes> {
    public abstract computeDelta(shape1: T, shape2: T): number;

    public static isColliding(delta: number): boolean {
        return delta > 0;
    }
}