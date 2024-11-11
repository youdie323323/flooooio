import { angleToRad, bodyDamageOrDamage, isPetal } from "./common/common";
import { Entity, onUpdateTick } from "./Entity";
import { EntityPool } from "./EntityPool";
import { Mob, MobData } from "./mob/Mob";
import { Player } from "./player/Player";
import { PetalData } from "./mob/petal/Petal";
import QuadTree from "./common/QuadTree";
import { mapCenterX, mapCenterY } from "./EntityChecksum";
import { MOB_PROFILES } from "../../shared/mobProfiles";
import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { MobType } from "../../shared/types";
import { computeDelta, Ellipse, isColliding } from "./common/collision";

// Arc + stroke size
export const FLOWER_ARC_RADIUS = 25 + (2.75 / 2);

export const BUBBLE_PUSH_FACTOR = 5;

export function EntityCollisionResponse<T extends new (...args: any[]) => Entity>(Base: T) {
  return class extends Base {
    quadTree: QuadTree;

    constructor(...args: any) {
      super(...args);

      this.quadTree = new QuadTree({
        x: mapCenterX,
        y: mapCenterY,
        w: mapCenterX * 2,
        h: mapCenterY * 2
      });
    }

    private calculatePush(entity1: Entity, entity2: Entity, delta: number): [number, number] {
      const dx = entity2.x - entity1.x;
      const dy = entity2.y - entity1.y;
      const distance = Math.hypot(dx, dy);

      if (distance === 0) return;

      const nx = dx / distance;
      const ny = dy / distance;

      // Use delta as overlap
      const pushX = nx * delta;
      const pushY = ny * delta;

      return [pushX, pushY];
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
        this.quadTree.insert({ x: mob.x, y: mob.y, unit: mob });
      });
      poolThis.clients.forEach(client => {
        if (this.id === client.id) return;
        this.quadTree.insert({ x: client.x, y: client.y, unit: client });
      });

      if (this instanceof Mob) {
        const profile1 = MOB_PROFILES[this.type] || PETAL_PROFILES[this.type];
        const searchRadius = (profile1.rx + profile1.ry) * (this.size / profile1.fraction) * 2;

        const nearby = this.quadTree.query({
          x: this.x,
          y: this.y,
          w: searchRadius,
          h: searchRadius
        });

        nearby.forEach(point => {
          const otherEntity = point.unit;
          if (this.id === otherEntity.id) return;
          if (otherEntity instanceof Mob) {
            // TODO: Fix multiple hit

            // Petal dont damaged to petal
            if (isPetal(this.type) && isPetal(otherEntity.type)) return;

            // Pet/Petal dont damaged to player/pet
            if ((this instanceof Player || isPetal(this.type)) && otherEntity.petParentPlayer) return;
            if ((otherEntity instanceof Player || isPetal(otherEntity.type)) && this.petParentPlayer) return;

            const profile2: MobData | PetalData = MOB_PROFILES[otherEntity.type] || PETAL_PROFILES[otherEntity.type];

            const ellipse1: Ellipse = {
              x: this.x,
              y: this.y,
              a: profile1.rx * (this.size / profile1.fraction),
              b: profile1.ry * (this.size / profile1.fraction),
              theta: angleToRad(this.angle),
            };

            const ellipse2: Ellipse = {
              x: otherEntity.x,
              y: otherEntity.y,
              a: profile2.rx * (otherEntity.size / profile2.fraction),
              b: profile2.ry * (otherEntity.size / profile2.fraction),
              theta: angleToRad(otherEntity.angle),
            };

            const delta = computeDelta(ellipse1, ellipse2);

            if (isColliding(delta)) {
              const push = this.calculatePush(this, otherEntity, delta);
              if (push) {
                // Only pop knockback to enemie (summoned mob)
                const multiplier1 = this.type === MobType.BUBBLE && otherEntity.petParentPlayer ? BUBBLE_PUSH_FACTOR : 1;
                const multiplier2 = otherEntity.type === MobType.BUBBLE && this.petParentPlayer ? BUBBLE_PUSH_FACTOR : 1;
                this.x -= push[0] * multiplier2 * 0.3;
                this.y -= push[1] * multiplier2 * 0.3;
                otherEntity.x += push[0] * multiplier1 * 0.3;
                otherEntity.y += push[1] * multiplier1 * 0.3;

                // Pet doesnt damaged to other pet
                if (this.petParentPlayer && otherEntity.petParentPlayer) return;

                if (
                  isPetal(this.type) || isPetal(otherEntity.type) ||
                  this.petParentPlayer || otherEntity.petParentPlayer
                ) {
                  this.health -= profile2[otherEntity.rarity][bodyDamageOrDamage(profile2[otherEntity.rarity])];
                  if (isPetal(this.type) && this.petalParentPlayer) {
                    otherEntity.mobLastAttackedBy = this.petalParentPlayer;
                  }
                  // Can targetted to pet too
                  if (this.petParentPlayer) {
                    otherEntity.mobLastAttackedBy = this;
                  }
                  otherEntity.health -= profile1[this.rarity][bodyDamageOrDamage(profile1[this.rarity])];
                  if (isPetal(otherEntity.type) && otherEntity.petalParentPlayer) {
                    this.mobLastAttackedBy = otherEntity.petalParentPlayer;
                  }
                  if (otherEntity.petParentPlayer) {
                    this.mobLastAttackedBy = otherEntity;
                  }
                }
              }
            }
          }
        });

        return;
      }

      if (this instanceof Player && !this.isDead) {
        const searchRadius = this.size * 50;
        const nearby = this.quadTree.query({
          x: this.x,
          y: this.y,
          w: searchRadius,
          h: searchRadius
        });

        nearby.forEach(point => {
          const otherEntity = point.unit;
          if (this.id === otherEntity.id) return;
          if (otherEntity instanceof Player) {
            const ellipse1: Ellipse = {
              // Arc (player)
              x: this.x,
              y: this.y,
              a: this.size,
              b: this.size,
              theta: angleToRad(this.angle),
            };

            const ellipse2: Ellipse = {
              // Arc (player)
              x: otherEntity.x,
              y: otherEntity.y,
              a: otherEntity.size,
              b: otherEntity.size,
              theta: angleToRad(otherEntity.angle),
            };

            const delta = computeDelta(ellipse1, ellipse2);

            if (isColliding(delta)) {
              const push = this.calculatePush(this, otherEntity, delta);
              if (push) {
                const thisMagnitude = this.magnitude / 255 * 1.25;
                const otherMagnitude = otherEntity.magnitude / 255 * 1.25;

                // This is like penalty (pushing someone with high speed well recive more knockback)
                this.x -= push[0] * thisMagnitude;
                this.y -= push[1] * thisMagnitude;
                otherEntity.x += push[0] * otherMagnitude;
                otherEntity.y += push[1] * otherMagnitude;
              }
            }

            return;
          }
          if (otherEntity instanceof Mob && !isPetal(otherEntity.type)) {
            const profile1: MobData = MOB_PROFILES[otherEntity.type];

            if (otherEntity.petParentPlayer) return;

            const ellipse1: Ellipse = {
              // Arc (player)
              x: this.x,
              y: this.y,
              a: this.size,
              b: this.size,
              theta: angleToRad(this.angle),
            };

            const ellipse2: Ellipse = {
              x: otherEntity.x,
              y: otherEntity.y,
              a: profile1.rx * (otherEntity.size / profile1.fraction),
              b: profile1.ry * (otherEntity.size / profile1.fraction),
              theta: angleToRad(otherEntity.angle),
            };

            const delta = computeDelta(ellipse1, ellipse2);

            if (isColliding(delta)) {
              const push = this.calculatePush(this, otherEntity, delta);
              if (push) {
                const multiplier = otherEntity.type === MobType.BUBBLE ? BUBBLE_PUSH_FACTOR : 1;
                this.x -= push[0] * multiplier * 10;
                this.y -= push[1] * multiplier * 10;
                otherEntity.x += push[0];
                otherEntity.y += push[1];

                // profile1 always mob, so no need to use bodyDamageOrDamage
                this.health -= profile1[otherEntity.rarity].bodyDamage;
                otherEntity.health -= this.bodyDamage;
              }
            }

            return;
          }
        });

        return;
      }
    }
  };
}