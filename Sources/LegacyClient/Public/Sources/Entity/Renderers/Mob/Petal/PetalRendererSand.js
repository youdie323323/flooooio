"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
class PetalRendererSand extends PetalRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 10;
        ctx.scale(scale, scale);
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(3.499999761581421, 6.062178134918213);
        ctx.lineTo(-3.500000476837158, 6.062177658081055);
        ctx.lineTo(-7, -6.119594218034763e-7);
        ctx.lineTo(-3.4999992847442627, -6.062178134918213);
        ctx.lineTo(3.4999992847442627, -6.062178134918213);
        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.fillStyle = this.toEffectedColor(context, "#E0C85C");
        ctx.strokeStyle = this.toEffectedColor(context, "#B5A24B");
        ctx.fill();
        ctx.stroke();
    }
}
exports.default = PetalRendererSand;
