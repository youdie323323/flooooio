import Entity from "../../../../../../Client/Sources/Game/Entity/Entity";
import { MobData } from "../../../../../../Shared/Entity/Statics/Mob/MobData";
import { MOB_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import { PetalData } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import { PETAL_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import { angleToRad } from "../../../Utils/common";
import { BaseMob } from "../../Dynamics/Mob/Mob";
import { BasePlayer } from "../../Dynamics/Player/Player";
import { AbstractCollider, Circle, CollidableShapes, Ellipse, isCircle, isEllipse } from "./Colliders/Collider";
import ColliderCircle from "./Colliders/ColliderCircle";
import ColliderEllipse from "./Colliders/ColliderEllipse";

const colliderEllipse = new ColliderEllipse();
const colliderCircle = new ColliderCircle();

export function returnGoodShape(entity: BaseMob | BasePlayer): CollidableShapes {
    // Ok im misunderstanding something; mix two collider is not possible, because
    // One of shape is circle and half one of shape is ellipse, its always ellipse
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

    if (entity instanceof BaseMob) {
        const profile: MobData | PetalData = MOB_PROFILES[entity.type] || PETAL_PROFILES[entity.type];

        const collision = profile.collision;

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