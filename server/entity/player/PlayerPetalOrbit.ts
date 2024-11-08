import { MoodKind } from "../../../shared/packet";
import { onUpdateTick } from "../Entity";
import { EntityPool, FPS } from "../EntityPool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { MobType, PetalType } from "../../../shared/types";
import { PetalData } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";
import { isPetal } from "../utils/common";

const BASE_ROTATE_SPEED = 2.5;
const LERP_FACTOR = 0.7;
const BOUNCE_DECAY = 0.25;
const BOUNCE_STRENGTH = 0.4;

export const UNMOODABLE_PETALS: Set<PetalType | MobType> = new Set([
    PetalType.BEETLE_EGG,
]);

export function PlayerPetalOrbit<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base {
        private rotation = 0;
        private historyX = new Array(10).fill(0);
        private historyY = new Array(10).fill(0);
        private petalPositions: { x: number, y: number }[] = [];
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
            const historyTargetIndex = (this.historyIndex + 7) % 10; // Avoids hardcoding
            this.historyIndex = (this.historyIndex + 1) % 10;

            const surface = this.slots.surface;
            const totalPetals = surface.length;

            let totalSpeed = 0;

            if (this.petalRadii.length !== totalPetals) {
                this.petalRadii = new Array(totalPetals).fill(40);
                this.petalBounces = new Array(totalPetals).fill(0);
                this.petalPositions = new Array(totalPetals).fill(null).map(() => ({ x: 0, y: 0 }));
            }

            for (let i = 0; i < totalPetals; i++) {
                const petal = surface[i];
                if (!petal) continue;

                const type = petal.type;
                const baseRadius = UNMOODABLE_PETALS.has(type) ? 40 :
                    this.mood === MoodKind.ANGRY ? 100 :
                        this.mood === MoodKind.SAD ? 25 : 40;

                const bounce = this.petalBounces[i];
                const radius = this.petalRadii[i];
                const newRadius = radius + bounce;
                this.petalRadii[i] = newRadius;
                this.petalBounces[i] = (baseRadius - newRadius) * BOUNCE_STRENGTH + bounce * (1 - BOUNCE_DECAY);

                const rotateAngle = (Math.PI * 2 * i) / totalPetals + this.rotation;
                const rad = this.petalRadii[i];
                const targetX = this.historyX[historyTargetIndex] + Math.cos(rotateAngle) * rad;
                const targetY = this.historyY[historyTargetIndex] + Math.sin(rotateAngle) * rad;

                // Smooth position using LERP
                const pos = this.petalPositions[i];
                pos.x += (targetX - pos.x) * LERP_FACTOR;
                pos.y += (targetY - pos.y) * LERP_FACTOR;

                // Assign smoothed positions
                petal.x = pos.x;
                petal.y = pos.y;

                // Adjust speed for FASTER petals
                if (type === PetalType.FASTER) {
                    const profile: PetalData = PETAL_PROFILES[type];
                    totalSpeed += profile[petal.rarity].rad;
                }
            }

            // Update rotation
            this.rotation += (BASE_ROTATE_SPEED + totalSpeed) / FPS;
        }
    };
}