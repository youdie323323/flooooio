"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
class MobRendererShell extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity, isSpecimen } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / (isSpecimen
            ? 25
            : 20);
        ctx.scale(scale, scale);
        ctx.lineWidth = 5;
        ctx.lineJoin = ctx.lineCap = "round";
        const bodyStrokeColor = this.toEffectedColor(context, "#CCB36D");
        { // Draw auricle
            ctx.beginPath();
            ctx.moveTo(-20, -15);
            ctx.quadraticCurveTo(-15, 0, -20, 15);
            ctx.lineTo(0, 3);
            ctx.lineTo(0, -3);
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle = bodyStrokeColor;
            ctx.fill();
            ctx.stroke();
        }
        { // Draw body
            ctx.beginPath();
            ctx.arc(0, 0, 30, -1.2566370964050293, 1.2566370964050293, false);
            ctx.quadraticCurveTo(0, 20, -15, 8);
            ctx.quadraticCurveTo(-20, 0, -15, -8);
            ctx.quadraticCurveTo(0, -20, 9.270508766174316, -28.531696319580078);
            ctx.closePath();
            ctx.fillStyle = this.toEffectedColor(context, "#FCDD86");
            ctx.fill();
            ctx.stroke();
        }
        { // Draw wrinkles
            ctx.lineWidth = 4;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(12, 15 * dir);
                ctx.quadraticCurveTo(0, 8 * dir, -8, 5 * dir);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(17.399999618530273, 6 * dir);
                ctx.quadraticCurveTo(0, 3.200000047683716 * dir, -6.199999809265137, 2 * dir);
                ctx.stroke();
            }
        }
    }
}
exports.default = MobRendererShell;
