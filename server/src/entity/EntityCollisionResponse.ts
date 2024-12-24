import { angleToRad, bodyDamageOrDamage, traverseMobSegment, isPetal, isEntityDead } from "../utils/common";
import { BaseEntityData, Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "./Entity";
import { WavePool } from "../wave/WavePool";
import { Mob, MobData, MobInstance, MobStat } from "./mob/Mob";
import { Player, PlayerInstance } from "./player/Player";
import { PetalData } from "./mob/petal/Petal";
import { computeDelta, Ellipse, isColliding } from "../utils/collision";
import { MobType } from "../../../shared/EntityType";
import { PETAL_PROFILES } from "../../../shared/entity/mob/petal/petalProfiles";
import { MOB_PROFILES } from "../../../shared/entity/mob/mobProfiles";

export function EntityCollisionResponse<T extends EntityMixinConstructor<Entity>>(Base: T) {
  return class MixedBase extends Base implements EntityMixinTemplate {
    private static readonly FLOWER_ARC_RADIUS = 25;
    private static readonly FLOWER_FRACTION = 25;

    private static readonly FLOWER_DEFAULT_SEARCH_DATA = {
      fraction: MixedBase.FLOWER_FRACTION,
      rx: MixedBase.FLOWER_ARC_RADIUS,
      ry: MixedBase.FLOWER_ARC_RADIUS,
    } satisfies Partial<BaseEntityData>;

    private static readonly BUBBLE_PUSH_FACTOR = 3;

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

    private calculateSearchRadius = ({ rx, ry, fraction }: Partial<BaseEntityData>, size: number): number => (rx + ry) * (size / fraction);

    [onUpdateTick](poolThis: WavePool): void {
      // Call parent onUpdateTick
      // to use multiple mixin functions
      if (super[onUpdateTick]) {
        super[onUpdateTick](poolThis);
      }

      if (this instanceof Mob) {
        // Basically mob is bigger than the player, so the mob-to-player collision are done on mob side

        const isPetalThis = isPetal(this.type);

        const profile1: MobData | PetalData = MOB_PROFILES[this.type] || PETAL_PROFILES[this.type];

        const searchRadius = this.calculateSearchRadius(profile1, this.size);

        const nearby = poolThis.sharedSpatialHash.search(this.x, this.y, searchRadius);

        nearby.forEach(_otherEntity => {
          const otherEntity = <MobInstance | PlayerInstance>_otherEntity;

          if (this.id === otherEntity.id) return;

          if (isEntityDead(poolThis, otherEntity)) return;

          // Collide mob -> mob
          if (otherEntity instanceof Mob) {
            const isPetalOther = isPetal(otherEntity.type);

            // Petal doesnt damaged/knockbacked to petal
            if (isPetalThis && isPetalOther) return;

            // Pet/petal doesnt damaged/knockbacked to petal/pet
            if (isPetalThis && otherEntity.petMaster) return;
            if (this.petMaster && isPetalOther) return;

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
                // Pop knockback to summoned mob (enemy), not including petal
                const bubbleMultiplierThis = otherEntity.type === MobType.BUBBLE && this.petMaster ? MixedBase.BUBBLE_PUSH_FACTOR : 1;
                const bubbleMultiplierOther = this.type === MobType.BUBBLE && otherEntity.petMaster ? MixedBase.BUBBLE_PUSH_FACTOR : 1;

                // Little knockback to mob if petal
                const baseMultiplierThis = isPetalOther ? 0.1 : 0.3;
                const baseMultiplierOther = isPetalThis ? 0.1 : 0.3;

                this.x -= push[0] * baseMultiplierThis * bubbleMultiplierThis;
                this.y -= push[1] * baseMultiplierThis * bubbleMultiplierThis;
                otherEntity.x += push[0] * baseMultiplierOther * bubbleMultiplierOther;
                otherEntity.y += push[1] * baseMultiplierOther * bubbleMultiplierOther;

                // Pet doesnt damaged to other pet
                if (this.petMaster && otherEntity.petMaster) return;

                if (
                  isPetalThis || isPetalOther ||
                  this.petMaster || otherEntity.petMaster
                ) {
                  this.health -= bodyDamageOrDamage(profile2[otherEntity.rarity]);
                  otherEntity.health -= bodyDamageOrDamage(profile1[this.rarity]);

                  // Dont trying to set lastAttackedEntity to petal because its not effective

                  if (!isPetalOther) {
                    // Propagate hit to head
                    const maybeSegmentsHead = traverseMobSegment(poolThis, otherEntity);

                    if (this.petalMaster) {
                      maybeSegmentsHead.lastAttackedEntity = this.petalMaster;
                    }

                    if (this.petMaster) {
                      // If pet attacked mob its target player or pet?
                      maybeSegmentsHead.lastAttackedEntity = this.petMaster;
                    }
                  }

                  if (!isPetalThis) {
                    const maybeSegmentsHead = traverseMobSegment(poolThis, this);

                    if (otherEntity.petalMaster) {
                      maybeSegmentsHead.lastAttackedEntity = otherEntity.petalMaster;
                    }

                    if (otherEntity.petMaster) {
                      maybeSegmentsHead.lastAttackedEntity = otherEntity.petMaster;
                    }
                  }
                }
              }
            }

            return;
          }

          // Collide mob -> player
          if (otherEntity instanceof Player) {
            // Dont collide to dead player
            if (otherEntity.isDead) return;

            if (!otherEntity.isCollidable) return;

            if (
              // Dont damage/knockback when petal
              this.petalMaster ||
              // Dont damage/knockback when pet
              this.petMaster
            ) return;

            const profile1: MobData = MOB_PROFILES[this.type];

            const ellipse1: Ellipse = {
              x: this.x,
              y: this.y,
              a: profile1.rx * (this.size / profile1.fraction),
              b: profile1.ry * (this.size / profile1.fraction),
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
                const bubbleMultiplier = this.type === MobType.BUBBLE ? MixedBase.BUBBLE_PUSH_FACTOR : 1;

                this.x -= push[0];
                this.y -= push[1];
                otherEntity.x += push[0] * 5 * bubbleMultiplier;
                otherEntity.y += push[1] * 5 * bubbleMultiplier;

                // profile1 always mob, so no need to use bodyDamageOrDamage
                this.health -= profile1[this.rarity].bodyDamage;
                // Take them body damage
                otherEntity.health -= otherEntity.bodyDamage;

                const maybeSegmentsHead = traverseMobSegment(poolThis, this);

                // Body hitted
                maybeSegmentsHead.lastAttackedEntity = otherEntity;
              }
            }

            return;
          }
        });

        return;
      }

      if (
        this instanceof Player &&
        // Dont collide when dead
        !this.isDead &&
        this.isCollidable
      ) {
        const searchRadius = this.calculateSearchRadius(MixedBase.FLOWER_DEFAULT_SEARCH_DATA, this.size);

        const nearby = poolThis.sharedSpatialHash.search(this.x, this.y, searchRadius);

        nearby.forEach(otherEntity => {
          if (!(otherEntity instanceof Player)) return;

          if (this.id === otherEntity.id) return;

          // Dont collide to dead player
          if (otherEntity.isDead) return;

          if (!otherEntity.isCollidable) return;

          // Collide player -> player

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
              this.x -= push[0] * 2;
              this.y -= push[1] * 2;
              otherEntity.x += push[0] * 2;
              otherEntity.y += push[1] * 2;
            }
          }
        });

        return;
      }
    }

    dispose = () => {
      if (super.dispose) {
        super.dispose();
      }
    }
  };
}