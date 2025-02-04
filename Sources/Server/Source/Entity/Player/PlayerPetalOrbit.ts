import { Entity, EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, UPDATE_ENTITIES_FPS } from "../../Wave/WavePool";
import { BasePlayer, Player } from "./Player";
import { isLivingSlot, PetalData, PetalStat } from "../Mob/Petal/Petal";
import { isPetal } from "../../Utils/common";
import { PetalType } from "../../../../Shared/EntityType";
import { PETAL_PROFILES } from "../../../../Shared/Entity/Mob/Petal/petalProfiles";
import { decodeMood, Mood } from "../../../../Shared/mood";
import { findNearestEntity } from "../Mob/MobAggressivePursuit";
import { MobInstance } from "../Mob/Mob";

export const MAX_CLUSTER_AMOUNT = 5;

const TAU = Math.PI * 2;

const HISTORY_SIZE = 10;

const PRECALC_SIZE = 360;
const lazyCosTable = new Float32Array(PRECALC_SIZE);
const lazySinTable = new Float32Array(PRECALC_SIZE);
for (let i = 0; i < PRECALC_SIZE; i++) {
    const angle = (i * TAU) / PRECALC_SIZE;
    lazyCosTable[i] = Math.cos(angle);
    lazySinTable[i] = Math.sin(angle);
}

const calcTableIndex = (i: number) => (((i % TAU + TAU) % TAU) * PRECALC_SIZE / TAU) | 0;

export const UNMOODABLE_PETALS: Set<PetalType> = new Set([
    PetalType.BEETLE_EGG,
]);

export function PlayerPetalOrbit<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly DEFAULT_ROTATE_SPEED = 2.5;

        private static readonly FRICTION_COEFFICIENT = 0.75;

        private static readonly SPRING_STRENGTH = 0.15;

        private static readonly PETAL_CLUSTER_RADIUS = 8;

        private static readonly SPIN_COEFFICIENT = 0.1;
        private static readonly SPIN_ANGLE_COEFFICIENT = 5;
        private static readonly SPIN_SIN_LOWER = 0.75;

        private rotation = 0;
        private historyIndex = 0;
        private historyX: Float32Array = new Float32Array(HISTORY_SIZE);
        private historyY: Float32Array = new Float32Array(HISTORY_SIZE);
        private petalRadii: Float32Array;
        private petalVelocities: Float32Array;
        private petalSpins: Float32Array[];

        [onUpdateTick](poolThis: WavePool): void {
            super[onUpdateTick](poolThis);

            this.historyX[this.historyIndex] = this.x;
            this.historyY[this.historyIndex] = this.y;
            const historyTargetIndex = (this.historyIndex + 8) % HISTORY_SIZE;
            this.historyIndex = (this.historyIndex + 1) % HISTORY_SIZE;

            const surface = this.slots.surface;
            const totalPetals = surface.length;

            if (!this.petalRadii || this.petalRadii.length !== totalPetals) {
                this.petalRadii = new Float32Array(totalPetals).fill(40);
                this.petalVelocities = new Float32Array(totalPetals).fill(0);
                this.petalSpins = new Array(totalPetals).fill(null).map(() => new Float32Array(MAX_CLUSTER_AMOUNT).fill(0));
            }

            const { 0: isAngry, 1: isSad } = decodeMood(this.mood);

            const numYinYang = surface.reduce(
                (acc, curr) => acc + (
                    curr && isLivingSlot(curr) && curr.length > 0 && curr[0].type === PetalType.YIN_YANG ? 1 : 0
                ),
                0
            );

            // Basically, every 2 yin yangs adds 1 ring
            // Yin yang changes the number of petals per ring by diving it by floor(num yin yang / 2) + 1

            const numRings = Math.floor(numYinYang / 2) + 1;

            const clockwise = numYinYang % 2;

            let realLength = 0;
            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isLivingSlot(petals)) continue;

                const firstPetal = petals[0];
                const profile = PETAL_PROFILES[firstPetal.type][firstPetal.rarity];
                realLength += profile.isCluster ? 1 : petals.length;
            }

            realLength = Math.ceil(realLength / numRings);

            let currentAngleIndex = 0;

            const targetX = this.historyX[historyTargetIndex];
            const targetY = this.historyY[historyTargetIndex];

            let totalSpeed = MixedBase.DEFAULT_ROTATE_SPEED;

            const spinRotationDelta =
                this.calculateRotationDelta(MixedBase.DEFAULT_ROTATE_SPEED, clockwise) *
                MixedBase.SPIN_ANGLE_COEFFICIENT;

            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isLivingSlot(petals)) continue;

                const firstPetal = petals[0];
                if (!isPetal(firstPetal.type)) continue;

                const profile: PetalData = PETAL_PROFILES[firstPetal.type];
                const rarityProfile: PetalStat = profile[firstPetal.rarity];

                // Add faster speed
                if (firstPetal.type === PetalType.FASTER) {
                    totalSpeed += rarityProfile.rad;
                }

                let targetRadius = UNMOODABLE_PETALS.has(firstPetal.type) ? 40 :
                    isAngry ? 80 :
                        isSad ? 25 :
                            40;

                // 25 is FLOWER_ARC_RADIUS
                targetRadius += ((this.size / Player.BASE_SIZE) - 1) * 25;

                const springForce = (targetRadius - this.petalRadii[i]) * MixedBase.SPRING_STRENGTH;
                this.petalVelocities[i] = this.petalVelocities[i] * MixedBase.FRICTION_COEFFICIENT + springForce;
                this.petalRadii[i] += this.petalVelocities[i];

                const ringIndex = Math.floor(currentAngleIndex / realLength);
                const rad = this.petalRadii[i] * (1 + (ringIndex * 0.5));

                const multipliedRotation = this.rotation * (1 + ((ringIndex - (numRings - 1)) * 0.1));

                const baseAngle = TAU * (currentAngleIndex % realLength) / realLength + multipliedRotation;
                currentAngleIndex++;

                if (
                    rarityProfile.isCluster &&
                    petals.length > 1
                ) {
                    const angleIndex = calcTableIndex(baseAngle);
                    const slotBaseX = targetX + lazyCosTable[angleIndex] * rad;
                    const slotBaseY = targetY + lazySinTable[angleIndex] * rad;

                    for (let j = 0; j < petals.length; j++) {
                        const petal = petals[j];

                        // Bit faster than orbit
                        const petalAngle = TAU * j / petals.length + multipliedRotation * 1.1;

                        this.doPetalOrbit(
                            petal,
                            slotBaseX,
                            slotBaseY,
                            MixedBase.PETAL_CLUSTER_RADIUS,
                            petalAngle,
                        );

                        const petalSpin = this.petalSpins[i];

                        if (
                            this.doPetalSpin(
                                poolThis,
                                petal,
                                petalSpin[j],
                            )
                        ) {
                            petalSpin[j] += spinRotationDelta;
                        };
                    }
                } else {
                    const petal = petals[0];

                    this.doPetalOrbit(
                        petal,
                        targetX,
                        targetY,
                        rad,
                        baseAngle
                    );

                    const petalSpin = this.petalSpins[i];

                    if (
                        this.doPetalSpin(
                            poolThis,
                            petal,
                            petalSpin[0],
                        )
                    ) {
                        petalSpin[0] += spinRotationDelta;
                    };
                }
            }

            const rotationDelta = this.calculateRotationDelta(totalSpeed, clockwise);
            this.rotation += rotationDelta;

            if (Math.abs(this.rotation) > Number.MAX_SAFE_INTEGER) {
                this.rotation = this.rotation % TAU;
            }
        }

        private calculateRotationDelta(
            totalSpeed: number,
            clockwise: number,
        ): number {
            return (totalSpeed * (clockwise ? -1 : 1)) / UPDATE_ENTITIES_FPS
        }

        private doPetalOrbit(
            petal: MobInstance,
            targetX: number,
            targetY: number,
            holdingRadius: number,
            angle: number
        ) {
            const angleIndex = calcTableIndex(angle);

            const chaseX = targetX + lazyCosTable[angleIndex] * holdingRadius;
            const chaseY = targetY + lazySinTable[angleIndex] * holdingRadius;

            const diffX = chaseX - petal.x;
            const diffY = chaseY - petal.y;

            const ACCELERATION = 0.25;

            const { petalVelocity: velocity } = petal;

            if (!velocity) return;

            velocity[0] += ACCELERATION * diffX;
            velocity[1] += ACCELERATION * diffY;

            velocity[0] *= MixedBase.FRICTION_COEFFICIENT;
            velocity[1] *= MixedBase.FRICTION_COEFFICIENT;

            petal.x += velocity[0];
            petal.y += velocity[1];
        }

        /**
         * Do petal spin within petal.
         * 
         * @returns - Is petal spinned or not.
         */
        private doPetalSpin(
            poolThis: WavePool,
            petal: MobInstance,
            rotation: number,
        ): boolean {
            const mobToSpin = findNearestEntity(
                petal,
                poolThis.getAllMobs()
                    .filter(p =>
                        !(
                            p.id === petal.id ||
                            isPetal(p.type) ||
                            p.petMaster
                        )
                    )
                    .filter(entity => {
                        const distance = Math.hypot(
                            entity.x - petal.x,
                            entity.y - petal.y
                        );

                        return distance <= (entity.size * (1 + MixedBase.SPIN_COEFFICIENT));
                    }),
            );

            petal.petalSpinningMob = !!mobToSpin;

            if (petal.petalSpinningMob) {
                const spiralRadius =
                    mobToSpin.size * (1 - MixedBase.SPIN_COEFFICIENT) *
                    (MixedBase.SPIN_SIN_LOWER + (Math.sin(rotation % TAU) + 1) / 2 * (1 - MixedBase.SPIN_SIN_LOWER));

                const spinAngleIndex = calcTableIndex(rotation);

                petal.x = mobToSpin.x + lazyCosTable[spinAngleIndex] * spiralRadius;
                petal.y = mobToSpin.y + lazySinTable[spinAngleIndex] * spiralRadius;
            }

            return petal.petalSpinningMob;
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }

            this.historyX = null;
            this.historyY = null;
            this.petalRadii = null;
            this.petalVelocities = null;

            for (let i = 0; i < this.petalSpins.length; i++) {
                // Dont forgot to release object items too
                this.petalSpins[i] = null;
            }
            this.petalSpins = null;
        }
    };
}