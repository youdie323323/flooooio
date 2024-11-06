import { angleToRad, bodyDamageOrDamage, isPetal } from "./utils/small";
import { isEllipseIntersecting } from "./utils/collision";
import { Entity, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";
import { Mob, MobData } from "./mob/Mob";
import { Player } from "./player/Player";
import { PetalData } from "./mob/petal/Petal";
import QuadTree from "./utils/QuadTree";
import { mapCenterX, mapCenterY } from "./EntityChecksum";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";

// Arc + stroke size
export const FLOWER_ARC_RADIUS = 25 + (2.75 / 2);

export function EntityCollisionResponse<T extends new (...args: any[]) => Entity>(Base: T) {
  return class extends Base {
    quadTree: QuadTree;

    constructor(...args: any) {
      super(...args);

      // This mixin is most laggy mixin, so i will use quad tree to reduce lags
      this.quadTree = new QuadTree({
        x: mapCenterX,
        y: mapCenterY,
        width: mapCenterX * 2,
        height: mapCenterY * 2
      });
    }

    private collisionRestitution(entity1: Entity, entity2: Entity) {
      const dx = entity2.x - entity1.x;
      const dy = entity2.y - entity1.y;

      const collisionAngle = Math.atan2(dy, dx);

      const getRadiusAtAngle = (entity: Entity, angle: number) => {
        const profile = entity instanceof Mob && (MOB_PROFILES[entity.type] || PETAL_PROFILES[entity.type]);

        const rx = entity instanceof Player ? FLOWER_ARC_RADIUS * (entity.size / FLOWER_ARC_RADIUS) : profile.rx * (entity.size / profile.fraction);
        const ry = entity instanceof Player ? FLOWER_ARC_RADIUS * (entity.size / FLOWER_ARC_RADIUS) : profile.ry * (entity.size / profile.fraction);

        const rotatedAngle = angle - (entity instanceof Mob ? angleToRad(entity.angle) : 0);

        return (rx * ry) / Math.sqrt(
          Math.pow(ry * Math.cos(rotatedAngle), 2) +
          Math.pow(rx * Math.sin(rotatedAngle), 2)
        );
      };

      const r1 = getRadiusAtAngle(entity1, collisionAngle);
      const r2 = getRadiusAtAngle(entity2, collisionAngle);

      const distance = Math.hypot(dx, dy);

      if (distance === 0) return;

      const nx = dx / distance;
      const ny = dy / distance;

      const overlap = (r1 + r2 - distance) / 2;

      const sizeFactorEntity1 = entity1.size / 30;
      const sizeFactorEntity2 = entity2.size / 30;

      const magnitude1 = Math.max(entity1.magnitude * sizeFactorEntity1, 1);
      const magnitude2 = Math.max(entity2.magnitude * sizeFactorEntity2, 1);
      const totalMagnitude = magnitude1 + magnitude2;

      const pushRatio1 = (magnitude2 / totalMagnitude) * sizeFactorEntity2;
      const pushRatio2 = (magnitude1 / totalMagnitude) * sizeFactorEntity1;

      const pushX = nx * overlap;
      const pushY = ny * overlap;

      return {
        pushX1: pushX * pushRatio1,
        pushY1: pushY * pushRatio1,
        pushX2: pushX * pushRatio2,
        pushY2: pushY * pushRatio2
      };
    }

    [onUpdateTick](poolThis: EntityPool): void {
      // Call parent onUpdateTick
      // to use multiple mixin functions
      if (super[onUpdateTick]) {
        super[onUpdateTick](poolThis);
      }

      this.quadTree.clear();

      poolThis.mobs.forEach(mob => {
        if (this.id === mob.id) return;
        this.quadTree.insert({ x: mob.x, y: mob.y, entity: mob });
      });
      poolThis.clients.forEach(client => {
        if (this.id === client.id) return;
        this.quadTree.insert({ x: client.x, y: client.y, entity: client });
      });

      if (this instanceof Mob) {
        const profile = MOB_PROFILES[this.type] || PETAL_PROFILES[this.type];
        const searchRadius = (profile.rx + profile.ry) * (this.size / profile.fraction) * 2;

        const nearby = this.quadTree.query({
          x: this.x,
          y: this.y,
          width: searchRadius,
          height: searchRadius
        });

        nearby.forEach(point => {
          const otherEntity = point.entity;
          if (this.id === otherEntity.id) return;
          if (otherEntity instanceof Mob) {
            // Petal dont damaged to petal
            if (isPetal(this.type) && isPetal(otherEntity.type)) return;

            const profile2: MobData | PetalData = MOB_PROFILES[otherEntity.type] || PETAL_PROFILES[otherEntity.type];

            if (isEllipseIntersecting({
              x: this.x,
              y: this.y,
              a: profile.rx * (this.size / profile.fraction),
              b: profile.ry * (this.size / profile.fraction),
              theta: angleToRad(this.angle),
            }, {
              x: otherEntity.x,
              y: otherEntity.y,
              a: profile2.rx * (otherEntity.size / profile2.fraction),
              b: profile2.ry * (otherEntity.size / profile2.fraction),
              theta: angleToRad(otherEntity.angle),
            })) {
              const push = this.collisionRestitution(this, otherEntity);
              if (push) {
                this.x -= push.pushX1 * 0.1;
                this.y -= push.pushY1 * 0.1;
                otherEntity.x += push.pushX2 * 0.1;
                otherEntity.y += push.pushY2 * 0.1;

                // Decrease both when either petal
                // TODO: fix multiple hit
                if (isPetal(this.type) || isPetal(otherEntity.type)) {
                  this.health -= profile2[otherEntity.rarity][bodyDamageOrDamage(profile2[otherEntity.rarity])];
                  otherEntity.health -= profile[this.rarity][bodyDamageOrDamage(profile[this.rarity])];
                }
              }
            }
          }
        });
      }

      if (this instanceof Player && !this.isDead) {
        const searchRadius = (FLOWER_ARC_RADIUS * (this.size / FLOWER_ARC_RADIUS)) * 50;
        const nearby = this.quadTree.query({
          x: this.x,
          y: this.y,
          width: searchRadius,
          height: searchRadius
        });

        nearby.forEach(point => {
          const otherEntity = point.entity;
          if (this.id === otherEntity.id) return;
          if (otherEntity instanceof Player) {
            if (isEllipseIntersecting({
              // Arc
              x: this.x,
              y: this.y,
              a: this.size,
              b: this.size,
              theta: 0
            }, {
              // Arc
              x: otherEntity.x,
              y: otherEntity.y,
              a: this.size,
              b: this.size,
              theta: 0
            })) {
              const push = this.collisionRestitution(this, otherEntity);
              if (push) {
                const overlapPenalty = Math.hypot(push.pushX1, push.pushY1) * 2;

                const thisMagnitude = this.magnitude / 255 * 25;
                const otherMagnitude = otherEntity.magnitude / 255 * 25;

                const thisClientPushMultiplier = (thisMagnitude > otherMagnitude ? overlapPenalty * (1 + thisMagnitude) : overlapPenalty);
                const otherClientPushMultiplier = (otherMagnitude > thisMagnitude ? overlapPenalty * (1 + otherMagnitude) : overlapPenalty);

                this.x -= push.pushX1 * thisClientPushMultiplier;
                this.y -= push.pushY1 * thisClientPushMultiplier;
                otherEntity.x += push.pushX2 * otherClientPushMultiplier;
                otherEntity.y += push.pushY2 * otherClientPushMultiplier;
              }
            }

            return;
          }
          if (otherEntity instanceof Mob && !isPetal(otherEntity.type)) {
            const profile1: MobData = MOB_PROFILES[otherEntity.type];

            if (isEllipseIntersecting({
              // Arc
              x: this.x,
              y: this.y,
              a: this.size,
              b: this.size,
              theta: 0
            }, {
              x: otherEntity.x,
              y: otherEntity.y,
              a: profile1.rx * (otherEntity.size / profile1.fraction),
              b: profile1.ry * (otherEntity.size / profile1.fraction),
              theta: angleToRad(otherEntity.angle),
            })) {
              const push = this.collisionRestitution(this, otherEntity);
              if (push) {
                this.x -= push.pushX1 * 10;
                this.y -= push.pushY1 * 10;
                otherEntity.x += push.pushX2;
                otherEntity.y += push.pushY2;

                // profile1 is always mob, so no need to use bodyDamageOrDamage
                this.health -= profile1[otherEntity.rarity].bodyDamage;
                otherEntity.health -= this.bodyDamage;
              }
            }

            return;
          }
        });
      }
    }
  };
}