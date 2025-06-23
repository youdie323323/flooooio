"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
class PetalRendererMagnet extends PetalRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 18;
        ctx.scale(scale, scale);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        const magnetNBodyColor = this.toEffectedColor(context, "#A44343");
        const magnetNStrokeColor = this.toEffectedColor(context, "#853636");
        const magnetSBodyColor = this.toEffectedColor(context, "#363685");
        const magnetSStrokeColor = this.toEffectedColor(context, "#4343A4");
        ctx.translate(-23, 0);
        ctx.beginPath();
        ctx.moveTo(39.5, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);
        ctx.lineWidth = 28;
        ctx.strokeStyle = magnetSBodyColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);
        ctx.lineWidth = 16.799999237060547;
        ctx.strokeStyle = magnetSStrokeColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(39.5, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);
        ctx.lineWidth = 28;
        ctx.strokeStyle = magnetNStrokeColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);
        ctx.lineWidth = 16.799999237060547;
        ctx.strokeStyle = magnetNBodyColor;
        ctx.stroke();
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(39.5, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);
        ctx.lineWidth = 28;
        ctx.strokeStyle = magnetSBodyColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, 18);
        ctx.quadraticCurveTo(0, 30, 0, 0);
        ctx.lineWidth = 16.799999237060547;
        ctx.strokeStyle = magnetSStrokeColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(39.5, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);
        ctx.lineWidth = 28;
        ctx.strokeStyle = magnetNStrokeColor;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, -18);
        ctx.quadraticCurveTo(0, -30, 0, 0);
        ctx.lineWidth = 16.799999237060547;
        ctx.strokeStyle = magnetNBodyColor;
        ctx.stroke();
    }
}
exports.default = PetalRendererMagnet;
