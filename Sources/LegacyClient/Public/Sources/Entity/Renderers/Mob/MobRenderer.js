"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Renderer_1 = __importDefault(require("../Renderer"));
const TAU = 2 * Math.PI;
class AbstractMobRenderer extends Renderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
    }
    drawBubble(context, fraction, isPetal) {
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / fraction;
        ctx.scale(scale, scale);
        const oldGlobalAlpha = ctx.globalAlpha;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.strokeStyle = ctx.fillStyle = this.toEffectedColor(context, "#ffffff");
        {
            ctx.beginPath();
            ctx.arc(10, 0, 2, 0, TAU);
            ctx.globalAlpha = oldGlobalAlpha * 0.4;
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        {
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, TAU);
            ctx.fill();
            ctx.clip();
            ctx.globalAlpha = oldGlobalAlpha * 0.5;
            ctx.lineWidth = isPetal ? 8 : 3;
            ctx.stroke();
        }
    }
}
exports.default = AbstractMobRenderer;
