import { deltaTime, selfId } from "../main";
import { TWO_PI } from "../constants";
import EntityPlayer from "./EntityPlayer";
import EntityMob from "./EntityMob";

function normalizeAngleDifference(startAngle: number, targetAngle: number) {
    const angleDifference = (targetAngle - startAngle) % TWO_PI;
    return (angleDifference * 2) % TWO_PI - angleDifference;
}

function interpolateAngle(startAngle: number, targetAngle: any, fraction: number) {
    return startAngle + normalizeAngleDifference(startAngle, targetAngle) * fraction;
}

function hx(rs: number[], rt: number[], ru: number) {
    const rv = 1 - ru;
    return [rs[0] * ru + rt[0] * rv, rs[1] * ru + rt[1] * rv, rs[2] * ru + rt[2] * rv];
}

let colorCache = {};
function colorToNumbers(rs: string) {
    if (!colorCache[rs]) {
        colorCache[rs] = [parseInt(rs.slice(1, 3), 16), parseInt(rs.slice(3, 5), 16), parseInt(rs.slice(5, 7), 16)];
    }
    return colorCache[rs];
}

function colorNumbersToRgbString(s5: number[]) {
    return "rgb(" + s5.join(",") + ")";
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
    id: number;
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
    maxHealth: number;

    constructor(id: number, x: number, y: number, size: number, health: number, maxHealth: number, angle: number) {
        this.id = id;
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
        this.maxHealth = maxHealth;
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

        const rI = Math.min(1, deltaTime / 100);
        this.eyeX += (Math.cos(this.nAngle) - this.eyeX) * rI;
        this.eyeY += (Math.sin(this.nAngle) - this.eyeY) * rI;

        this.angle = interpolateAngle(this.oAngle, this.nAngle, this.t);
        this.moveCounter += Math.hypot(this.x - this.nx, this.y - this.ny) / 50 * deltaTime / 18;

        if (this.redHealthTimer > 0) {
            this.redHealthTimer -= deltaTime / 600;
            if (this.redHealthTimer < 0) {
                this.redHealthTimer = 0;
            }
        }
        if (this.health < 1) {
            this.hpAlpha = px(this.hpAlpha, 1, 200);
        }
        if (this.redHealthTimer === 0) {
            this.redHealth += (this.health - this.redHealth) * Math.min(1, deltaTime / 200);
        }
    }

    getSkinColor(color) {
        const rJ = 1 - this.hurtT;
        if (rJ >= 1) {
            return color;
        }
        color = colorToNumbers(color);
        color = hx(color, [255, 0, 0], rJ * 0.25 + 0.75);
        return colorNumbersToRgbString(color);
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

function px(s0: number, s1: number, s2: number) {
    return s0 + (s1 - s0) * Math.min(1, deltaTime / s2);
}