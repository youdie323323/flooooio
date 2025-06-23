"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
const TAU = 2 * Math.PI;
class PetalRendererEgg extends PetalRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 20;
        ctx.scale(scale, scale);
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 40, 0, 0, TAU);
        ctx.fillStyle = this.toEffectedColor(context, "#fff0b8");
        ctx.strokeStyle = this.toEffectedColor(context, "#cfc295");
        ctx.fill();
        ctx.stroke();
    }
}
exports.default = PetalRendererEgg;
