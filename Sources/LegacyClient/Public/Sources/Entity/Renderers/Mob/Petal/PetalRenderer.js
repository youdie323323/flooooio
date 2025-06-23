"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("../MobRenderer"));
const TAU = 2 * Math.PI;
class AbstractPetalRenderer extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
    }
    drawBasicLike(context, fraction, strokeWidth, fillColor, strokeColor) {
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / fraction;
        ctx.scale(scale, scale);
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, TAU);
        ctx.fillStyle = this.toEffectedColor(context, fillColor);
        ctx.strokeStyle = this.toEffectedColor(context, strokeColor);
        ctx.fill();
        ctx.stroke();
    }
}
exports.default = AbstractPetalRenderer;
