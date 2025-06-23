"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const TAU = 2 * Math.PI;
class MobRendererSpider extends MobRenderer_1.default {
    static { this.curves = new Array(); }
    static createCurve(angle, direction, offset = 6) {
        direction *= -1;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const startX = cosAngle * 25;
        const startY = sinAngle * 25;
        MobRendererSpider.curves.push({
            dir: direction,
            start: [startX, startY],
            curve: [
                startX + cosAngle * 23 + -sinAngle * direction * offset,
                startY + sinAngle * 23 + cosAngle * direction * offset,
                startX + cosAngle * 46,
                startY + sinAngle * 46,
            ],
        });
    }
    static {
        MobRendererSpider.createCurve((Math.PI / 180) * 40, 1);
        MobRendererSpider.createCurve((Math.PI / 180) * 75, 1, 3);
        MobRendererSpider.createCurve((Math.PI / 180) * 105, -1, 3);
        MobRendererSpider.createCurve((Math.PI / 180) * 140, -1);
        MobRendererSpider.createCurve((-Math.PI / 180) * 40, -1);
        MobRendererSpider.createCurve((-Math.PI / 180) * 75, -1, 3);
        MobRendererSpider.createCurve((-Math.PI / 180) * 105, 1, 3);
        MobRendererSpider.createCurve((-Math.PI / 180) * 140, 1);
    }
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity, isSpecimen } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / (isSpecimen
            ? 60
            : 25);
        ctx.scale(scale, scale);
        ctx.lineCap = "round";
        { // Legs
            ctx.lineWidth = 10;
            ctx.strokeStyle = this.toEffectedColor(context, "#323032");
            const moveCounter = entity.moveCounter / 1.25;
            const { curves } = MobRendererSpider;
            for (let i = 0; i < curves.length; i++) {
                const curve = curves[i];
                ctx.save();
                ctx.rotate(curve.dir * Math.sin(moveCounter + i) * 0.2);
                ctx.beginPath();
                ctx.moveTo(...curve.start);
                ctx.quadraticCurveTo(...curve.curve);
                ctx.stroke();
                ctx.restore();
            }
        }
        { // Body
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, TAU);
            ctx.fillStyle = this.toEffectedColor(context, "#403525");
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, TAU);
            ctx.fillStyle = this.toEffectedColor(context, "#4F412E");
            ctx.fill();
        }
    }
}
exports.default = MobRendererSpider;
