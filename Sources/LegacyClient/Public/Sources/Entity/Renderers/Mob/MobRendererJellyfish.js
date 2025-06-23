"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const TAU = 2 * Math.PI;
class MobRendererJellyfish extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity, isSpecimen } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 20;
        ctx.scale(scale, scale);
        ctx.strokeStyle = ctx.fillStyle = this.toEffectedColor(context, "#ffffff");
        const oldGlobalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = oldGlobalAlpha * 0.6;
        ctx.lineCap = "round";
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const tentacleAngle = i / 10 * TAU;
            const tentacleT = isSpecimen
                ? 500
                : Date.now();
            const tentacleMoveWave = Math.sin(tentacleAngle + tentacleT / 500);
            ctx.save();
            ctx.rotate(tentacleAngle);
            ctx.translate(17.5, 0);
            ctx.moveTo(0, 0);
            ctx.rotate(tentacleMoveWave * 0.5);
            ctx.quadraticCurveTo(4, tentacleMoveWave * -2, 14, 0);
            ctx.restore();
        }
        ctx.stroke();
        { // Body
            using _guard = this.guard(ctx);
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, TAU);
            ctx.globalAlpha = oldGlobalAlpha * 0.5;
            ctx.fill();
            ctx.clip();
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}
exports.default = MobRendererJellyfish;
