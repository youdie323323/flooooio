import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, WAVE_UPDATE_FPS } from "../../wave/WavePool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { isUnconvertableSlot, PetalData, PetalStat } from "../mob/petal/Petal";
import { isPetal } from "../../utils/common";
import { PetalType, Mood, MobType } from "../../../../shared/enum";
import { PETAL_PROFILES } from "../../../../shared/entity/mob/petal/petalProfiles";

const TAU = Math.PI * 2;

const BASE_ROTATE_SPEED = 2.5;
const BOUNCE_DECAY = 0.24;
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

export const UNMOODABLE_PETALS: Set<PetalType | MobType> = new Set([
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

            let realLength = 0;
            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isUnconvertableSlot(petals)) continue;
                const firstPetal = petals[0];
                const profile = PETAL_PROFILES[firstPetal.type][firstPetal.rarity];
                realLength += profile.isCluster ? 1 : petals.length;
            }

            let currentAngleIndex = 0;
            const targetX = this.historyX[historyTargetIndex];
            const targetY = this.historyY[historyTargetIndex];

            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isUnconvertableSlot(petals)) continue;

                const firstPetal = petals[0];
                const profile = PETAL_PROFILES[firstPetal.type];
                const rarityProfile = profile[firstPetal.rarity];

                const baseRadius =
                    this.mood === Mood.ANGRY ? isPetal(firstPetal.type) && UNMOODABLE_PETALS.has(firstPetal.type) ? 40 : 80 :
                        this.mood === Mood.SAD ? 25 : 40;

                const bounce = this.petalBounces[i];
                this.petalRadii[i] += bounce;
                this.petalBounces[i] = (baseRadius - this.petalRadii[i]) * BOUNCE_STRENGTH + bounce * (1 - BOUNCE_DECAY);

                if (firstPetal.type === PetalType.FASTER) {
                    totalSpeed += rarityProfile.rad;
                }

                const rad = this.petalRadii[i];

                if (rarityProfile.isCluster && petals.length > 1) {
                    const baseAngle = TAU * currentAngleIndex / realLength + this.rotation;
                    currentAngleIndex++;

                    const angleIndex = ((baseAngle % TAU) * PRECALC_SIZE / TAU) | 0;
                    const slotBaseX = targetX + lazyCosTable[angleIndex] * rad;
                    const slotBaseY = targetY + lazySinTable[angleIndex] * rad;

                    for (let j = 0; j < petals.length; j++) {
                        // Bit faster than rotation
                        const petalAngle = TAU * j / petals.length + 1.1 * this.rotation;
                        const petalAngleIndex = ((petalAngle % TAU) * PRECALC_SIZE / TAU) | 0;

                        const petal = petals[j];
                        petal.x = slotBaseX + lazyCosTable[petalAngleIndex] * PETAL_CLUSTER_RADIUS;
                        petal.y = slotBaseY + lazySinTable[petalAngleIndex] * PETAL_CLUSTER_RADIUS;
                    }
                } else {
                    for (let j = 0; j < petals.length; j++) {
                        const baseAngle = TAU * currentAngleIndex / realLength + this.rotation;
                        const angleIndex = ((baseAngle % TAU) * PRECALC_SIZE / TAU) | 0;
                        currentAngleIndex++;

                        const petal = petals[j];
                        petal.x = targetX + lazyCosTable[angleIndex] * rad;
                        petal.y = targetY + lazySinTable[angleIndex] * rad;
                    }
                }
            }

            this.rotation += totalSpeed / WAVE_UPDATE_FPS;
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