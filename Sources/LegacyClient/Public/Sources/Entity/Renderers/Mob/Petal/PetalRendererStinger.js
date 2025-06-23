"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
class PetalRendererStinger extends PetalRenderer_1.default {
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
        ctx.lineTo(-3.500000476837158, 6.062177658081055);
        ctx.lineTo(-3.4999992847442627, -6.062178134918213);
        ctx.closePath();
        ctx.fillStyle = this.toEffectedColor(context, "#333333");
        ctx.strokeStyle = this.toEffectedColor(context, "#292929");
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
    }
}
exports.default = PetalRendererStinger;
