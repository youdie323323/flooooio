"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
const TAU = 2 * Math.PI;
const YIN_ANGLE_START = Math.PI / 2;
const YIN_ANGLE_END = Math.PI * 3 / 2;
class PetalRendererYinYang extends PetalRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 20;
        ctx.scale(scale, scale);
        const clipFill = (fillColor, strokeColor) => {
            ctx.save();
            ctx.clip();
            ctx.fillStyle = this.toEffectedColor(context, fillColor);
            ctx.strokeStyle = this.toEffectedColor(context, strokeColor);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        clipFill("#333333", "#222222");
        ctx.rotate(Math.PI);
        ctx.beginPath();
        ctx.arc(0, 0, 20, -YIN_ANGLE_START, YIN_ANGLE_START);
        ctx.arc(0, 10, 10, YIN_ANGLE_START, YIN_ANGLE_END);
        ctx.arc(0, -10, 10, YIN_ANGLE_START, YIN_ANGLE_END, true);
        clipFill("#ffffff", "#cfcfcf");
        ctx.rotate(-Math.PI);
        ctx.beginPath();
        ctx.arc(0, 10, 10, YIN_ANGLE_START, YIN_ANGLE_END);
        clipFill("#333333", "#222222");
    }
}
exports.default = PetalRendererYinYang;
