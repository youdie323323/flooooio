import { deltaTime } from "../main";

function calculateAngleDistance(startAngle: number, endAngle: number) {
    const angleDiff = (endAngle - startAngle) % (Math.PI * 2);
    return (angleDiff * 2) % (Math.PI * 2) - angleDiff;
}

function interpolateAngle(startAngle: number, endAngle: any, progress: number) {
    return startAngle + calculateAngleDistance(startAngle, endAngle) * progress;
}

function interpolateColor(sourceColor: number[], targetColor: number[], progress: number) {
    const inverseProgress = 1 - progress;
    return [
        sourceColor[0] * progress + targetColor[0] * inverseProgress,
        sourceColor[1] * progress + targetColor[1] * inverseProgress,
        sourceColor[2] * progress + targetColor[2] * inverseProgress
    ];
}

let colorCache = {};
function hexToRgb(hexColor: string) {
    if (!colorCache[hexColor]) {
        colorCache[hexColor] = [
            parseInt(hexColor.slice(1, 3), 16),
            parseInt(hexColor.slice(3, 5), 16),
            parseInt(hexColor.slice(5, 7), 16)
        ];
    }
    return colorCache[hexColor];
}

function rgbArrayToString(rgbArray: number[]) {
    return "rgb(" + rgbArray.join(",") + ")";
}

function smoothInterpolate(current: number, target: number, duration: number) {
    return current + (target - current) * Math.min(1, deltaTime / duration);
}

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
        readonly id: number, 
        x: number, 
        y: number, 
        angle: number, 
        size: number, 
        health: number, 
        readonly maxHealth: number,
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

    update() {
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

    getSkinColor(color: any) {
        const rHurtT = 1 - this.hurtT;
        if (rHurtT >= 1) {
            return color;
        }
        color = hexToRgb(color);
        color = interpolateColor(color, [255, 0, 0], rHurtT * 0.25 + 0.75);
        return rgbArrayToString(color);
    }

    deadPreDraw(ctx: CanvasRenderingContext2D) {
        if (this.isDead) {
            const rJ = Math.sin(this.deadT * Math.PI / 2);
            const rK = 1 + rJ * 1;
            ctx.scale(rK, rK);
            ctx.globalAlpha *= 1 - rJ;
        }
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}