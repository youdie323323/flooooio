"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
const PI2 = Math.PI / 2;
class PetalRendererWing extends PetalRenderer_1.default {
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
        ctx.arc(0, 0, 15, -PI2, PI2, false);
        ctx.quadraticCurveTo(10, 0, 0, -15);
        ctx.closePath();
        ctx.fillStyle = this.toEffectedColor(context, "#FFFFFF");
        ctx.strokeStyle = this.toEffectedColor(context, "#CFCFCF");
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
    }
}
exports.default = PetalRendererWing;
