import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, UPDATE_ENTITIES_FPS } from "../../wave/WavePool";
import { BasePlayer, Player } from "./Player";
import { isLivingSlot } from "../mob/petal/Petal";
import { isPetal } from "../../utils/common";
import { PetalType } from "../../../../shared/EntityType";
import { PETAL_PROFILES } from "../../../../shared/entity/mob/petal/petalProfiles";
import { decodeMood, Mood } from "../../../../shared/mood";

const TAU = Math.PI * 2;

const BASE_ROTATE_SPEED = 2.5;
const BOUNCE_DECAY = 0.2;
const BOUNCE_STRENGTH = 0.2;
const PETAL_CLUSTER_RADIUS = 8;
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
    return class extends Base implements EntityMixinTemplate {
        private rotation = 0;
        private historyX: Float32Array = new Float32Array(HISTORY_SIZE);
        private historyY: Float32Array = new Float32Array(HISTORY_SIZE);
        private petalRadii: Float32Array;
        private petalBounces: Float32Array;
        private historyIndex = 0;

        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            this.historyX[this.historyIndex] = this.x;
            this.historyY[this.historyIndex] = this.y;
            const historyTargetIndex = (this.historyIndex + 8) % HISTORY_SIZE;
            this.historyIndex = (this.historyIndex + 1) % HISTORY_SIZE;

            const surface = this.slots.surface;
            const totalPetals = surface.length;

            let totalSpeed = BASE_ROTATE_SPEED;

            if (!this.petalRadii || this.petalRadii.length !== totalPetals) {
                this.petalRadii = new Float32Array(totalPetals).fill(40);
                this.petalBounces = new Float32Array(totalPetals).fill(0);
            }

            const numYinYang = surface.reduce(
                (acc, curr) => acc + (
                    curr && isLivingSlot(curr) && curr.length > 0 && curr[0].type === PetalType.YIN_YANG ? 1 : 0
                ),
                0
            );

            /**
             * Basically, every 2 yin yangs adds 1 ring.
             * Yin yang changes the number of petals per ring by diving it by floor(num yin yang / 2) + 1.
             */

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

            const { 0: isAngry, 1: isSad } = decodeMood(this.mood);

            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isLivingSlot(petals)) continue;

                const firstPetal = petals[0];
                const profile = PETAL_PROFILES[firstPetal.type];
                const rarityProfile = profile[firstPetal.rarity];

                let baseRadius =
                    isAngry ?
                        isPetal(firstPetal.type) && UNMOODABLE_PETALS.has(firstPetal.type) ? 40 : 80
                        :
                        isSad ? 25 : 40;

                // TODO: fix distance error
                // baseRadius *= this.size / Player.BASE_SIZE;

                const bounce = this.petalBounces[i];
                this.petalRadii[i] += bounce;
                this.petalBounces[i] = (baseRadius - this.petalRadii[i]) * BOUNCE_STRENGTH + bounce * (1 - BOUNCE_DECAY);

                if (firstPetal.type === PetalType.FASTER) {
                    totalSpeed += rarityProfile.rad;
                }

                const ringIndex = Math.floor(currentAngleIndex / realLength);
                const rad = this.petalRadii[i] * (1 + (ringIndex * 0.5));

                const multipliedRotation = this.rotation * (1 + ((ringIndex - (numRings - 1)) * 0.1));
                
                if (rarityProfile.isCluster && petals.length > 1) {
                    const baseAngle = TAU * (currentAngleIndex % realLength) / realLength + multipliedRotation;
                    currentAngleIndex++;

                    const angleIndex = calcTableIndex(baseAngle);
                    const slotBaseX = targetX + lazyCosTable[angleIndex] * rad;
                    const slotBaseY = targetY + lazySinTable[angleIndex] * rad;

                    for (let j = 0; j < petals.length; j++) {
                        // Bit faster than orbit
                        const petalAngle = TAU * j / petals.length + 1.1 * multipliedRotation;
                        const petalAngleIndex = calcTableIndex(petalAngle);

                        const petal = petals[j];
                        petal.x = slotBaseX + lazyCosTable[petalAngleIndex] * PETAL_CLUSTER_RADIUS;
                        petal.y = slotBaseY + lazySinTable[petalAngleIndex] * PETAL_CLUSTER_RADIUS;
                    }
                } else {
                    for (let j = 0; j < petals.length; j++) {
                        const baseAngle = TAU * (currentAngleIndex % realLength) / realLength + multipliedRotation;
                        currentAngleIndex++;

                        const angleIndex = calcTableIndex(baseAngle);

                        const petal = petals[j];
                        petal.x = targetX + lazyCosTable[angleIndex] * rad;
                        petal.y = targetY + lazySinTable[angleIndex] * rad;
                    }
                }
            }

            this.rotation += (clockwise ? -1 : 1) * totalSpeed / UPDATE_ENTITIES_FPS;

            if (Math.abs(this.rotation) > Number.MAX_SAFE_INTEGER) {
                this.rotation = this.rotation % TAU;
            }
        }

        dispose = () => {
            if (super.dispose) {
                super.dispose();
            }

            this.historyX = null;
            this.historyY = null;
            this.petalRadii = null;
            this.petalBounces = null;
        }
    };
}