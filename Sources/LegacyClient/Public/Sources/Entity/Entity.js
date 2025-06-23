"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Application_1 = require("../../../Application");
const TAU = 2 * Math.PI;
function calculateAngleDistance(startAngle, endAngle) {
    const angleDiff = (endAngle - startAngle) % TAU;
    return (angleDiff * 2) % TAU - angleDiff;
}
const interpolateAngle = (startAngle, endAngle, progress) => startAngle + calculateAngleDistance(startAngle, endAngle) * progress;
const smoothInterpolate = (current, target, duration) => current + (target - current) * Math.min(1, Application_1.deltaTime / duration);
class Entity {
    constructor(id, x, y, angle, size, health) {
        this.id = id;
        this.x = this.nx = this.ox = x;
        this.y = this.ny = this.oy = y;
        this.angle = this.nAngle = this.oAngle = angle;
        this.size = this.nSize = this.oSize = size;
        this.redHealth = this.health = this.nHealth = this.oHealth = health;
        this.redHealthTimer = 0;
        this.poisonT = 0;
        this.isPoison = false;
        this.eyeX = 1;
        this.eyeY = 0;
        this.updateT = 0;
        this.hurtT = 0;
        this.deadT = 0;
        this.isDead = false;
        this.moveCounter = this.totalT = 0;
        this.hpAlpha = 1;
    }
    update() {
        const deltaTime100 = Application_1.deltaTime / 100;
        const deltaTime150 = deltaTime100 * 2 / 3;
        const deltaTime200 = deltaTime100 / 2;
        if (this.isDead) {
            this.deadT += deltaTime150;
        }
        if (this.hurtT > 0) {
            this.hurtT -= deltaTime150;
            if (this.hurtT < 0) {
                this.hurtT = 0;
            }
        }
        this.poisonT += (this.isPoison ? 1 : -1) * deltaTime200;
        this.poisonT = Math.min(1, Math.max(0, this.poisonT));
        this.updateT += deltaTime100;
        this.t = Math.min(1, this.updateT);
        this.x = this.ox + (this.nx - this.ox) * this.t;
        this.y = this.oy + (this.ny - this.oy) * this.t;
        this.health = this.oHealth + (this.nHealth - this.oHealth) * this.t;
        this.size = this.oSize + (this.nSize - this.oSize) * (this.t * 2);
        const eyeTimeFactor = Math.min(1, deltaTime100);
        this.eyeX += (Math.cos(this.nAngle) - this.eyeX) * eyeTimeFactor;
        this.eyeY += (Math.sin(this.nAngle) - this.eyeY) * eyeTimeFactor;
        this.angle = interpolateAngle(this.oAngle, this.nAngle, this.t);
        this.moveCounter += (Math.hypot(this.x - this.nx, this.y - this.ny) * Application_1.deltaTime) / 900;
        this.totalT += Application_1.deltaTime / 40;
        if (this.redHealthTimer > 0) {
            this.redHealthTimer -= Application_1.deltaTime / 600;
            if (this.redHealthTimer < 0) {
                this.redHealthTimer = 0;
            }
        }
        if (this.health < 1) {
            this.hpAlpha = smoothInterpolate(this.hpAlpha, 1, 200);
        }
        if (this.redHealthTimer === 0) {
            this.redHealth += (this.health - this.redHealth) * Math.min(1, deltaTime200);
        }
    }
}
exports.default = Entity;
