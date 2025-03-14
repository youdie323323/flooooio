import type { MobData } from "../../../../../../Shared/Entity/Statics/Mob/MobData";
import { MOB_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import type { PetalData } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import { PETAL_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import type { RealEntity } from "../../Dynamics/Entity";
import { angleToRad } from "../../Dynamics/EntityCoordinateMovement";
// import { BaseMob } from "../../Dynamics/Mob/Mob";
import type { CollidableShapes, Ellipse } from "./Colliders/Collider";
import { AbstractCollider, isCircle, isEllipse } from "./Colliders/Collider";
import ColliderCircle from "./Colliders/ColliderCircle";
import ColliderEllipse from "./Colliders/ColliderEllipse";

const colliderEllipse = new ColliderEllipse();
const colliderCircle = new ColliderCircle();

export function returnGoodShape(entity: RealEntity): CollidableShapes {
    // Ok im misunderstanding something; mix two collider is not possible, because
    // if one of shape is circle and half one of shape is ellipse, its always collide with ellipse

    /*
    let a: number, b: number;

    if (entity instanceof BaseMob) {
        const profile: MobData | PetalData = MOB_PROFILES[entity.type] || PETAL_PROFILES[entity.type];

        const collision = profile.collision;

        a = collision.rx * (entity.size / collision.fraction);
        b = collision.ry * (entity.size / collision.fraction);
    } else {
        // Arc (player)

        a = b = entity.size;
    }

    if (a === b) {
        // If a and b are same, we can just use circle collider

        return {
            x: entity.x,
            y: entity.y,
            // Radius is a and b (same)
            r: a,
        } satisfies Circle;
    } else {
        // Normally collide with ellipse

        return {
            x: entity.x,
            y: entity.y,
            a,
            b,
            theta: angleToRad(entity.angle),
        } satisfies Ellipse;
    }
    */

    let a: number, b: number;

    if (
        // entity instanceof BaseMob
        // The reason i didnt use instanceof BaseMob is because cause circular dependency and fancy errors
        // I cant thinking any smarter way to solve this issue
        "rarity" in entity
    ) {
        const { collision }: MobData | PetalData = MOB_PROFILES[entity.type] || PETAL_PROFILES[entity.type];

        a = collision.rx * (entity.size / collision.fraction);
        b = collision.ry * (entity.size / collision.fraction);
    } else {
        // Arc (player)

        a = b = entity.size;
    }

    const theta = a === b
        // Circle-like
        ? 0
        // Ellipse
        : angleToRad(entity.angle);

    return {
        x: entity.x,
        y: entity.y,
        a,
        b,
        theta,
    } satisfies Ellipse;
}

export function accordinglyComputeDelta<T extends CollidableShapes>(s0: T, s1: T): number {
    if (
        isCircle(s0) &&
        // Yea typescript type system is shit and cant know s1 is circle
        isCircle(s1)
    ) {
        return colliderCircle.computeDelta(s0, s1);
    } else if (
        isEllipse(s0) &&
        isEllipse(s1)
    ) {
        return colliderEllipse.computeDelta(s0, s1);
    }

    throw new Error("Unreachable");
}

export function isColliding(delta: number): boolean {
    return AbstractCollider.isColliding(delta);
}