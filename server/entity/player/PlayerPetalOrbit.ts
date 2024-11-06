import { MoodKind } from "../../../shared/packet";
import { onUpdateTick } from "../Entity";
import { EntityPool, FPS } from "../EntityPool";
import { Mob } from "../mob/Mob";
import { BasePlayer } from "./Player";
import { PetalType } from "../../../shared/types";
import { PetalData } from "../mob/petal/Petal";
import { PETAL_PROFILES } from "../../../shared/petalProfiles";

const BASE_ROTATE_SPEED = 2.5;
const LERP_FACTOR = 0.7;
const BOUNCE_DECAY = 0.25;
const BOUNCE_STRENGTH = 0.4;

export function PlayerPetalOrbit<T extends new (...args: any[]) => BasePlayer>(Base: T) {
    return class extends Base {
        private rotation: number = 0;
        private historyX: number[] = new Array(10).fill(0);
        private historyY: number[] = new Array(10).fill(0);
        private petalPositions: { x: number, y: number }[] = [];
        private petalRadii: number[] = [];
        private petalBounces: number[] = [];
        private targetRadius: number = 40;

        private updateRadius(current: number, bounce: number): { radius: number, bounce: number } {
            const newRadius = current + bounce;
            const newBounce = (this.targetRadius - newRadius) * BOUNCE_STRENGTH + (bounce * (1 - BOUNCE_DECAY));
            return {
                radius: newRadius,
                bounce: newBounce
            };
        }

        [onUpdateTick](poolThis: EntityPool): void {
            if (super[onUpdateTick]) {
                super[onUpdateTick](poolThis);
            }

            this.historyX.push(this.x);
            if (this.historyX.length > 10) {
                this.historyX.shift();
            }

            this.historyY.push(this.y);
            if (this.historyY.length > 10) {
                this.historyY.shift();
            }

            if (this.mood === MoodKind.ANGRY) {
                // Current is 80 but was wave
                this.targetRadius = 100;
            } else if (this.mood === MoodKind.SAD) {
                this.targetRadius = 25;
            } else {
                this.targetRadius = 40;
            }

            const petalsExcludeEmpty = this.slots.surface.filter(v => v != null);

            let totalSpeed: number = 0;

            if (this.petalRadii.length !== this.slots.surface.length) {
                this.petalRadii = new Array(this.slots.surface.length).fill(this.targetRadius);
                this.petalBounces = new Array(this.slots.surface.length).fill(0);
            }

            for (let i = 0; i < this.slots.surface.length; i++) {
                if (this.slots.surface[i] instanceof Mob) {
                    let rotateAngle = (Math.PI * 2 * i) / petalsExcludeEmpty.length + this.rotation;

                    const updated = this.updateRadius(this.petalRadii[i], this.petalBounces[i]);
                    this.petalRadii[i] = updated.radius;
                    this.petalBounces[i] = updated.bounce;

                    const rad = this.petalRadii[i];
                    const targetX = this.historyX[7] + Math.cos(rotateAngle) * rad;
                    const targetY = this.historyY[7] + Math.sin(rotateAngle) * rad;

                    if (!this.petalPositions[i]) {
                        this.petalPositions[i] = {
                            x: targetX,
                            y: targetY
                        };
                    }

                    this.petalPositions[i].x += (targetX - this.petalPositions[i].x) * LERP_FACTOR;
                    this.petalPositions[i].y += (targetY - this.petalPositions[i].y) * LERP_FACTOR;

                    this.slots.surface[i].x = this.petalPositions[i].x;
                    this.slots.surface[i].y = this.petalPositions[i].y;

                    if (this.slots.surface[i].type === PetalType.FASTER) {
                        const profile: PetalData = PETAL_PROFILES[this.slots.surface[i].type];
                        totalSpeed += profile[this.slots.surface[i].rarity].rad;
                    }
                }
            }

            this.rotation += (BASE_ROTATE_SPEED + totalSpeed) / FPS;
        }
    };
}