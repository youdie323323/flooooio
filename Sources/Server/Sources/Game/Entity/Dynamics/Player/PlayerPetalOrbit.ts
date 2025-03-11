import { MobType, PetalType } from "../../../../../../Shared/Entity/Statics/EntityType";
import { PetalData } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalData";
import { PETAL_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/Petal/PetalProfiles";
import { decodeMood } from "../../../../../../Shared/Mood";
import { WavePool, UPDATE_ENTITIES_FPS } from "../../../Genres/Wave/WavePool";
import { isPetal } from "../../../Utils/common";
import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { MobInstance } from "../Mob/Mob";
import { findNearestEntity } from "../Mob/MobAggressivePursuit";
import { MAX_CLUSTER_AMOUNT, isClusterPetal, isDynamicPetal } from "../Mob/Petal/Petal";
import { BasePlayer, Player } from "./Player";

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

export const UNMOODABLE_PETALS: Set<MobType | PetalType> = new Set([
    PetalType.BeetleEgg,
]);

export function PlayerPetalOrbit<T extends EntityMixinConstructor<BasePlayer>>(Base: T) {
    return class MixedBase extends Base implements EntityMixinTemplate {
        private static readonly DEFAULT_ROTATE_SPEED = 2.5;

        private static readonly SPRING_STRENGTH = 0.15;
        private static readonly RADIUS_FRICTION = 0.75;

        private static readonly ORBIT_ACCELERATION = 0.2;
        private static readonly ORBIT_FRICTION = 0.75;

        private static readonly PETAL_CLUSTER_RADIUS = 8;

        private static readonly SPIN_INTERPOLATION_SPEED = 0.6;
        private static readonly SPIN_NEAREST_SIZE_COEFFICIENT = 0.3;
        private static readonly SPIN_ANGLE_COEFFICIENT = 10;

        private rotation = 0;
        private historyIndex = 0;
        private historyX: Float32Array = new Float32Array(HISTORY_SIZE);
        private historyY: Float32Array = new Float32Array(HISTORY_SIZE);
        private petalRadii: Float32Array;
        private petalRadiusVelocities: Float32Array;
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
                this.petalRadiusVelocities = new Float32Array(totalPetals).fill(0);

                this.petalSpins = new Array(totalPetals).fill(null).map(() =>
                    new Float32Array(MAX_CLUSTER_AMOUNT).fill(0),
                );
            }

            const { 0: isAngry, 1: isSad } = decodeMood(this.mood);

            const numYinYang = surface.reduce(
                (acc, curr) => acc + (
                    (
                        curr &&
                        isDynamicPetal(curr) &&
                        curr.length > 0 &&
                        curr[0].type === PetalType.YinYang
                    )
                        ? 1
                        : 0
                ),
                0,
            );

            // Basically, every 2 yin yangs adds 1 ring
            // Yin yang changes the number of petals per ring by diving it by floor(num yin yang / 2) + 1

            const numRings = Math.floor(numYinYang / 2) + 1;

            const clockwise = numYinYang % 2;

            let realLength = 0;
            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isDynamicPetal(petals)) continue;

                realLength += isClusterPetal(petals)
                    ? 1
                    : petals.length;
            }

            realLength = Math.ceil(realLength / numRings);

            let currentAngleIndex = 0;

            const targetX = this.historyX[historyTargetIndex];
            const targetY = this.historyY[historyTargetIndex];

            let totalSpeed = MixedBase.DEFAULT_ROTATE_SPEED;

            const spinRotationDelta =
                this.calculateRotationDelta(
                    MixedBase.DEFAULT_ROTATE_SPEED *
                    MixedBase.SPIN_ANGLE_COEFFICIENT, clockwise);

            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isDynamicPetal(petals)) continue;

                const firstPetal = petals[0];
                if (!isPetal(firstPetal.type)) continue;

                const profile: PetalData = PETAL_PROFILES[firstPetal.type];
                const rarityProfile = profile[firstPetal.rarity];

                // Add faster speed
                if (firstPetal.type === PetalType.Faster) {
                    totalSpeed += rarityProfile.rad;
                }

                let targetRadius = UNMOODABLE_PETALS.has(firstPetal.type)
                    ? 40
                    : isAngry
                        ? 90
                        : isSad
                            ? 25
                            : 40;

                // 25 is FLOWER_ARC_RADIUS
                targetRadius += ((this.size / Player.BASE_SIZE) - 1) * 25;

                const springForce = (targetRadius - this.petalRadii[i]) * MixedBase.SPRING_STRENGTH;
                this.petalRadiusVelocities[i] = this.petalRadiusVelocities[i] * MixedBase.RADIUS_FRICTION + springForce;
                this.petalRadii[i] += this.petalRadiusVelocities[i];

                const ringIndex = Math.floor(currentAngleIndex / realLength);
                const rad = this.petalRadii[i] * (1 + (ringIndex * 0.5));

                const multipliedRotation = this.rotation * (1 + ((ringIndex - (numRings - 1)) * 0.1));

                const baseAngle = TAU * (currentAngleIndex % realLength) / realLength + multipliedRotation;
                currentAngleIndex++;

                if (isClusterPetal(petals)) {
                    const angleIndex = calcTableIndex(baseAngle);

                    const slotBaseX = targetX + lazyCosTable[angleIndex] * rad;
                    const slotBaseY = targetY + lazySinTable[angleIndex] * rad;

                    for (let j = 0; j < petals.length; j++) {
                        const petal = petals[j];

                        const petalSpin = this.petalSpins[i];

                        // Bit faster than orbit
                        const petalAngle = TAU * j / petals.length + multipliedRotation * 1.1;

                        this.doPetalOrbit(
                            petal,
                            slotBaseX,
                            slotBaseY,
                            MixedBase.PETAL_CLUSTER_RADIUS,
                            petalAngle,
                        );

                        this.doPetalSpin(
                            poolThis,
                            petal,
                            petalSpin[j],
                            i, j,
                        );

                        if (petal.petalIsSpinningMob) {
                            petalSpin[j] += spinRotationDelta;
                        }
                    }
                } else {
                    const petal = petals[0];

                    const petalSpin = this.petalSpins[i];

                    this.doPetalOrbit(
                        petal,
                        targetX,
                        targetY,
                        rad,
                        baseAngle,
                    );

                    this.doPetalSpin(
                        poolThis,
                        petal,
                        petalSpin[0],
                        i, 0,
                    );

                    if (petal.petalIsSpinningMob) {
                        petalSpin[0] += spinRotationDelta;
                    }
                }
            }

            const rotationDelta = this.calculateRotationDelta(totalSpeed, clockwise);
            this.rotation += rotationDelta;

            // Limit in the tau
            if (Math.abs(this.rotation) > Number.MAX_SAFE_INTEGER) {
                this.rotation %= TAU;
            }
        }

        private calculateRotationDelta(
            totalSpeed: number,
            clockwise: number,
        ): number {
            return (totalSpeed * (clockwise ? -1 : 1)) / UPDATE_ENTITIES_FPS;
        }

        private doPetalOrbit(
            petal: MobInstance,
            targetX: number,
            targetY: number,
            holdingRadius: number,
            angle: number,
        ) {
            const angleIndex = calcTableIndex(angle);

            const chaseX = targetX + lazyCosTable[angleIndex] * holdingRadius;
            const chaseY = targetY + lazySinTable[angleIndex] * holdingRadius;

            const diffX = chaseX - petal.x;
            const diffY = chaseY - petal.y;

            const { petalVelocity: velocity } = petal;

            if (!velocity) return;

            velocity[0] += MixedBase.ORBIT_ACCELERATION * diffX;
            velocity[1] += MixedBase.ORBIT_ACCELERATION * diffY;

            velocity[0] *= MixedBase.ORBIT_FRICTION;
            velocity[1] *= MixedBase.ORBIT_FRICTION;

            petal.x += velocity[0];
            petal.y += velocity[1];
        }

        /**
         * Do petal spin within petal.
         */
        private doPetalSpin(
            poolThis: WavePool,
            petal: MobInstance,
            rotation: number,
            i: number, j: number,
        ) {
            const mobToSpin = findNearestEntity(
                petal,
                poolThis.getAllMobs()
                    .filter(p =>
                        !(
                            p.id === petal.id ||
                            isPetal(p.type) ||
                            p.petMaster
                        ),
                    )
                    .filter(entity => {
                        const distance = Math.hypot(
                            entity.x - petal.x,
                            entity.y - petal.y,
                        );

                        return distance <= (entity.size * (1 + MixedBase.SPIN_NEAREST_SIZE_COEFFICIENT));
                    }),
            );

            const wasSpinning = petal.petalIsSpinningMob;
            petal.petalIsSpinningMob = !!mobToSpin;

            if (petal.petalIsSpinningMob) {
                if (!wasSpinning) {
                    const petalSpin = this.petalSpins[i];

                    const targetAngle = Math.atan2(
                        petal.y - mobToSpin.y,
                        petal.x - mobToSpin.x,
                    );

                    let angleDiff = targetAngle - petalSpin[j];

                    angleDiff = ((angleDiff % TAU) + TAU) % TAU;
                    if (angleDiff > Math.PI) {
                        angleDiff -= TAU;
                    }

                    petalSpin[j] = (petalSpin[j] + angleDiff) % TAU;
                }

                const spinAngleIndex = calcTableIndex(rotation);
                const targetX = mobToSpin.x + lazyCosTable[spinAngleIndex] * mobToSpin.size;
                const targetY = mobToSpin.y + lazySinTable[spinAngleIndex] * mobToSpin.size;

                petal.x += (targetX - petal.x) * MixedBase.SPIN_INTERPOLATION_SPEED;
                petal.y += (targetY - petal.y) * MixedBase.SPIN_INTERPOLATION_SPEED;
            }
        }

        dispose(): void {
            if (super.dispose) {
                super.dispose();
            }

            this.historyX = null;
            this.historyY = null;
            this.petalRadii = null;
            this.petalRadiusVelocities = null;

            for (let i = 0; i < this.petalSpins.length; i++) {
                // Dont forgot to release object items too
                this.petalSpins[i] = null;
            }
            this.petalSpins = null;
        }
    };
}