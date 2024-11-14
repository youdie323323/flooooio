import { onUpdateTick } from "../Entity";
import { EntityPool, UPDATE_FPS } from "../EntityPool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { MobType, PetalType } from "../../../shared/types";
import { isLivingPetal, PetalData } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { MoodKind } from "../../../shared/mood";
import { TWO_PI } from "../utils/common";

const BASE_ROTATE_SPEED = 2.5;
const LERP_FACTOR = 0.7;
const BOUNCE_DECAY = 0.275;
const BOUNCE_STRENGTH = 0.25;

export const UNMOODABLE_PETALS: Set<PetalType | MobType> = new Set([
    PetalType.BEETLE_EGG,
]);

export function PlayerPetalOrbit<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base {
        private rotation = 0;
        private historyX: number[] = new Array(10).fill(0);
        private historyY: number[] = new Array(10).fill(0);
        private petalPositions: [number, number][] = [];
        private petalRadii: number[] = [];
        private petalBounces: number[] = [];
        private historyIndex = 0; // Ring buffer index

        [onUpdateTick](poolThis: EntityPool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            // Update position history using a ring buffer
            this.historyX[this.historyIndex] = this.x;
            this.historyY[this.historyIndex] = this.y;
            const historyTargetIndex = (this.historyIndex + 8) % 10; // Avoids hardcoding
            this.historyIndex = (this.historyIndex + 1) % 10;

            const surface = this.slots.surface;
            const totalPetals = surface.length;

            let totalSpeed = 0;

            if (this.petalRadii.length !== totalPetals) {
                this.petalRadii = new Array(totalPetals).fill(40);
                this.petalBounces = new Array(totalPetals).fill(0);
                this.petalPositions = new Array(totalPetals).fill(null).map(() => [0, 0]);
            }

            const petalsExcludeEmpty = surface.filter(v => v != null);

            for (let i = 0; i < totalPetals; i++) {
                const petal = surface[i];
                if (!petal || !isLivingPetal(petal)) continue;

                const type = petal.type;

                const baseRadius = UNMOODABLE_PETALS.has(type) ? 40 :
                    this.mood === MoodKind.ANGRY ? 80 :
                        this.mood === MoodKind.SAD ? 25 : 40;

                // This need rework
                const bounce = this.petalBounces[i];
                const radius = this.petalRadii[i];
                const newRadius = radius + bounce;
                this.petalRadii[i] = newRadius;
                this.petalBounces[i] = (baseRadius - this.petalRadii[i]) * BOUNCE_STRENGTH + this.petalBounces[i] * (1 - BOUNCE_DECAY);

                const rotateAngle = (TWO_PI * i) / petalsExcludeEmpty.length + this.rotation;
                const rad = this.petalRadii[i];
                const targetX = this.historyX[historyTargetIndex] + Math.cos(rotateAngle) * rad;
                const targetY = this.historyY[historyTargetIndex] + Math.sin(rotateAngle) * rad;

                const pos = this.petalPositions[i];
                pos[0] += (targetX - pos[0]) * LERP_FACTOR;
                pos[1] += (targetY - pos[1]) * LERP_FACTOR;

                petal.x = pos[0];
                petal.y = pos[1];

                if (type === PetalType.FASTER) {
                    const profile: PetalData = PETAL_PROFILES[type];
                    totalSpeed += profile[petal.rarity].rad;
                }
            }

            this.rotation += (BASE_ROTATE_SPEED + totalSpeed) / UPDATE_FPS;
        }
    };
}