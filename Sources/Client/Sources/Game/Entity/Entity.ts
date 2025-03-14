import { memo } from "../../../../Shared/Utils/Memoize";
import { deltaTime } from "../../../Main";

const TAU = Math.PI * 2;

function calculateAngleDistance(startAngle: number, endAngle: number) {
    const angleDiff = (endAngle - startAngle) % TAU;

    return (angleDiff * 2) % TAU - angleDiff;
}

const interpolateAngle = memo(
    (startAngle: number, endAngle: number, progress: number) =>
        startAngle + calculateAngleDistance(startAngle, endAngle) * progress,
);

const smoothInterpolate = memo(
    (current: number, target: number, duration: number): number => {
        return current + (target - current) * Math.min(1, deltaTime / duration);
    },
);

export default abstract class Entity {
    x: number;
    y: number;
    ox: number;
    nx: number;
    ny: number;
    oy: number;
    t: number;
    updateT: number;
    size: number;
    nSize: number;
    oSize: number;
    eyeX: number;
    eyeY: number;
    angle: number;
    nAngle: number;
    oAngle: number;
    health: number;
    nHealth: number;
    oHealth: number;
    hurtT: number;
    deadT: number;
    isDead: boolean;
    redHealth: number;
    redHealthTimer: number;
    moveCounter: number;
    hpAlpha: number;

    constructor(
        /**
         * Depicts the broad outlines of the entity and does not depict any other dynamic information.
         */
        public readonly onlyDrawGeneralPart: boolean = false,

        readonly id: number,
        x: number,
        y: number,
        angle: number,
        size: number,
        health: number,
    ) {
        this.x = this.nx = this.ox = x;
        this.y = this.ny = this.oy = y;
        this.angle = this.nAngle = this.oAngle = angle;
        this.size = this.nSize = this.oSize = size;
        this.redHealth = this.health = this.nHealth = this.oHealth = health;
        this.redHealthTimer = 0;
        this.eyeX = 1;
        this.eyeY = 0;
        this.updateT = 0;
        this.hurtT = 0;
        this.deadT = 0;
        this.isDead = false;
        this.moveCounter = 0;
        this.hpAlpha = 1;
    }

    public update() {
        if (this.isDead) {
            this.deadT += deltaTime / 200;
        }

        if (this.hurtT > 0) {
            this.hurtT -= deltaTime / 150;
            if (this.hurtT < 0) {
                this.hurtT = 0;
            }
        }

        this.updateT += deltaTime / 100;
        this.t = Math.min(1, this.updateT);
        this.x = this.ox + (this.nx - this.ox) * this.t;
        this.y = this.oy + (this.ny - this.oy) * this.t;
        this.health = this.oHealth + (this.nHealth - this.oHealth) * this.t;
        this.size = this.oSize + (this.nSize - this.oSize) * this.t;

        const eyeTimeFactor = Math.min(1, deltaTime / 100);
        this.eyeX += (Math.cos(this.nAngle) - this.eyeX) * eyeTimeFactor;
        this.eyeY += (Math.sin(this.nAngle) - this.eyeY) * eyeTimeFactor;

        this.angle = interpolateAngle(this.oAngle, this.nAngle, this.t);
        this.moveCounter += Math.hypot(this.x - this.nx, this.y - this.ny) / 50 * deltaTime / 18;

        if (this.redHealthTimer > 0) {
            this.redHealthTimer -= deltaTime / 600;
            if (this.redHealthTimer < 0) {
                this.redHealthTimer = 0;
            }
        }

        if (this.health < 1) {
            this.hpAlpha = smoothInterpolate(this.hpAlpha, 1, 200);
        }

        if (this.redHealthTimer === 0) {
            this.redHealth += (this.health - this.redHealth) * Math.min(1, deltaTime / 200);
        }
    }
}