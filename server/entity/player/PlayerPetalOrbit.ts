import { EntityMixinTemplate, onUpdateTick } from "../Entity";
import { WavePool, UPDATE_FPS } from "../../wave/WavePool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { isSpawnableSlot, PetalData, PetalStat } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { isPetal, TWO_PI } from "../../utils/common";
import { PetalType, Mood } from "../../../shared/enum";

const BASE_ROTATE_SPEED = 2.5;
const BOUNCE_DECAY = 0.225;
const BOUNCE_STRENGTH = 0.25;
const PETAL_CLUSTER_RADIUS = 8;

export const UNMOODABLE_PETALS: Set<PetalType> = new Set([
    PetalType.BEETLE_EGG,
]);

export function PlayerPetalOrbit<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base implements EntityMixinTemplate {
        private rotation = 0;
        private historyX: number[] = new Array(10).fill(0);
        private historyY: number[] = new Array(10).fill(0);
        private petalRadii: number[] = [];
        private petalBounces: number[] = [];
        private historyIndex = 0;

        [onUpdateTick](poolThis: WavePool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            this.historyX[this.historyIndex] = this.x;
            this.historyY[this.historyIndex] = this.y;
            const historyTargetIndex = (this.historyIndex + 8) % 10;
            this.historyIndex = (this.historyIndex + 1) % 10;

            const surface = this.slots.surface;
            const totalPetals = surface.length;

            let totalSpeed = 0;

            if (this.petalRadii.length !== totalPetals) {
                this.petalRadii = new Array(totalPetals).fill(40);
                this.petalBounces = new Array(totalPetals).fill(0);
            }

            const realLength = surface.map((petals) => {
                if (!petals || !isSpawnableSlot(petals)) return 0;
                const firstPetal = petals[0];
                return PETAL_PROFILES[firstPetal.type][firstPetal.rarity].isCluster ? 1 : petals.length;
            }).reduce((accumulator, currentValue) => {
                return accumulator + currentValue;
            }, 0);

            let currentAngleIndex = 0;

            for (let i = 0; i < totalPetals; i++) {
                const petals = surface[i];
                if (!petals || !isSpawnableSlot(petals)) continue;

                /**
                 * First value for profile utilities.
                 */
                const firstPetal = petals[0];

                const profile: PetalData = PETAL_PROFILES[firstPetal.type];
                const rarityProfile: PetalStat = profile[firstPetal.rarity];

                {
                    const baseRadius = isPetal(firstPetal.type) && UNMOODABLE_PETALS.has(firstPetal.type) ? 40 :
                        this.mood === Mood.ANGRY ? 80 :
                            this.mood === Mood.SAD ? 25 : 40;

                    this.petalRadii[i] += this.petalBounces[i];
                    this.petalBounces[i] = (baseRadius - this.petalRadii[i]) * BOUNCE_STRENGTH + this.petalBounces[i] * (1 - BOUNCE_DECAY);

                    if (firstPetal.type === PetalType.FASTER) {
                        totalSpeed += rarityProfile.rad;
                    }
                }

                const rad = this.petalRadii[i];

                if (rarityProfile.isCluster && /** Since single cluster rotation bit fancy, ill use spread if single */ petals.length > 1) {
                    const baseAngle = TWO_PI * currentAngleIndex / realLength + this.rotation;
                    currentAngleIndex++;

                    const slotBaseX = this.historyX[historyTargetIndex] + Math.cos(baseAngle) * rad;
                    const slotBaseY = this.historyY[historyTargetIndex] + Math.sin(baseAngle) * rad;

                    for (let j = 0; j < petals.length; j++) {
                        const petal = petals[j];
                        const petalAngle = TWO_PI * j / petals.length + ( /** Bit faster than normal */ 1.1 * this.rotation);

                        petal.x = slotBaseX + Math.cos(petalAngle) * PETAL_CLUSTER_RADIUS;
                        petal.y = slotBaseY + Math.sin(petalAngle) * PETAL_CLUSTER_RADIUS;
                    }
                } else {
                    for (let j = 0; j < petals.length; j++) {
                        const baseAngle = TWO_PI * currentAngleIndex / realLength + this.rotation;
                        currentAngleIndex++;

                        const petal = petals[j];
                        petal.x = this.historyX[historyTargetIndex] + Math.cos(baseAngle) * rad;
                        petal.y = this.historyY[historyTargetIndex] + Math.sin(baseAngle) * rad;
                    }
                }
            }

            this.rotation += (BASE_ROTATE_SPEED + totalSpeed) / UPDATE_FPS;
        }

        free() {
            if (super["free"]) {
                super["free"]();
            }

            this.historyX = null;
            this.historyY = null;
            this.petalRadii = null;
            this.petalBounces = null;
        }
    };
}