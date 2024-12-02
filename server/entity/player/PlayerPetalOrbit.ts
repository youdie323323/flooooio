import { EntityMixinConstructor, EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, WAVE_UPDATE_FPS } from "../../wave/WavePool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { isSpawnableSlot, PetalData, PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { isPetal, TWO_PI } from "../../utils/common";
import { PetalType, Mood } from "../../../shared/enum";

const BASE_ROTATE_SPEED = 2.5;
const BOUNCE_DECAY = 0.225;
const BOUNCE_STRENGTH = 0.2;
const PETAL_CLUSTER_RADIUS = 8;
const HISTORY_SIZE = 10;

const PRECALC_SIZE = 360;
const cosTable = new Float32Array(PRECALC_SIZE);
const sinTable = new Float32Array(PRECALC_SIZE);
for (let i = 0; i < PRECALC_SIZE; i++) {
    const angle = (i * TWO_PI) / PRECALC_SIZE;
    cosTable[i] = Math.cos(angle);
    sinTable[i] = Math.sin(angle);
}

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

            let realLength = 0;
            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isSpawnableSlot(petals)) continue;
                const firstPetal = petals[0];
                const profile = PETAL_PROFILES[firstPetal.type][firstPetal.rarity];
                realLength += profile.isCluster ? 1 : petals.length;
            }

            let currentAngleIndex = 0;
            const targetX = this.historyX[historyTargetIndex];
            const targetY = this.historyY[historyTargetIndex];

            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isSpawnableSlot(petals)) continue;

                const firstPetal = petals[0];
                const profile = PETAL_PROFILES[firstPetal.type];
                const rarityProfile = profile[firstPetal.rarity];

                const baseRadius = isPetal(firstPetal.type) && UNMOODABLE_PETALS.has(firstPetal.type) ? 40 :
                    this.mood === Mood.ANGRY ? 80 :
                        this.mood === Mood.SAD ? 25 : 40;

                const bounce = this.petalBounces[i];
                this.petalRadii[i] += bounce;
                this.petalBounces[i] = (baseRadius - this.petalRadii[i]) * BOUNCE_STRENGTH + bounce * (1 - BOUNCE_DECAY);

                if (firstPetal.type === PetalType.FASTER) {
                    totalSpeed += rarityProfile.rad;
                }

                const rad = this.petalRadii[i];

                if (rarityProfile.isCluster && petals.length > 1) {
                    const baseAngle = TWO_PI * currentAngleIndex / realLength + this.rotation;
                    currentAngleIndex++;

                    const angleIndex = ((baseAngle % TWO_PI) * PRECALC_SIZE / TWO_PI) | 0;
                    const slotBaseX = targetX + cosTable[angleIndex] * rad;
                    const slotBaseY = targetY + sinTable[angleIndex] * rad;

                    for (let j = 0; j < petals.length; j++) {
                        // Bit faster than rotation
                        const petalAngle = TWO_PI * j / petals.length + 1.1 * this.rotation;
                        const petalAngleIndex = ((petalAngle % TWO_PI) * PRECALC_SIZE / TWO_PI) | 0;
                        
                        const petal = petals[j];
                        petal.x = slotBaseX + cosTable[petalAngleIndex] * PETAL_CLUSTER_RADIUS;
                        petal.y = slotBaseY + sinTable[petalAngleIndex] * PETAL_CLUSTER_RADIUS;
                    }
                } else {
                    for (let j = 0; j < petals.length; j++) {
                        const baseAngle = TWO_PI * currentAngleIndex / realLength + this.rotation;
                        const angleIndex = ((baseAngle % TWO_PI) * PRECALC_SIZE / TWO_PI) | 0;
                        currentAngleIndex++;

                        const petal = petals[j];
                        petal.x = targetX + cosTable[angleIndex] * rad;
                        petal.y = targetY + sinTable[angleIndex] * rad;
                    }
                }
            }

            this.rotation += totalSpeed / WAVE_UPDATE_FPS;
        }

        free = () => {
            if (super.free) {
                super.free();
            }

            this.historyX = null;
            this.historyY = null;
            this.petalRadii = null;
            this.petalBounces = null;
        }
    };
}