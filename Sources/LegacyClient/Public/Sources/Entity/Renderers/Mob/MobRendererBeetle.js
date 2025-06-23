"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../../../Utils/Color");
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const TAU = 2 * Math.PI;
function createBeetleBodyPath() {
    const path = new Path2D();
    path.moveTo(0, -30);
    path.quadraticCurveTo(40, -30, 40, 0);
    path.quadraticCurveTo(40, 30, 0, 30);
    path.quadraticCurveTo(-40, 30, -40, 0);
    path.quadraticCurveTo(-40, -30, 0, -30);
    path.closePath();
    return path;
}
const beetleBodyPath = createBeetleBodyPath();
class MobRendererBeetle extends MobRenderer_1.default {
    static { this.ARC_POINTS = [
        [-17, -12],
        [17, -12],
        [0, -15],
    ]; }
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 40;
        ctx.scale(scale, scale);
        ctx.lineCap = ctx.lineJoin = "round";
        { // Draw beak
            ctx.lineWidth = 6;
            ctx.fillStyle = ctx.strokeStyle = "#333333";
            const { beakAngle } = entity;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.save();
                ctx.translate(30, 10 * dir);
                ctx.rotate(beakAngle * dir);
                ctx.beginPath();
                ctx.moveTo(0, dir * 7);
                ctx.quadraticCurveTo(25, dir * 16, 40, 0);
                ctx.quadraticCurveTo(20, dir * 6, 0, 0);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }
        {
            ctx.lineWidth = 7;
            const skinColor = entity.isPet
                ? "#ffe667"
                : "#8f5db0";
            ctx.fillStyle = this.toEffectedColor(context, skinColor);
            ctx.fill(beetleBodyPath);
            // Arc points are same color with this
            ctx.fillStyle = ctx.strokeStyle = this.toEffectedColor(context, (0, Color_1.darkened)(skinColor, Color_1.DARKENED_BASE));
            ctx.stroke(beetleBodyPath);
        }
        { // Draw wrinkle
            ctx.lineWidth = 6;
            // Draw center line
            ctx.beginPath();
            ctx.moveTo(-21, 0);
            ctx.quadraticCurveTo(0, -3, 21, 0);
            ctx.stroke();
            ctx.beginPath();
            for (let dir = -1; dir <= 1; dir += 2) {
                MobRendererBeetle.ARC_POINTS.forEach(([x, y]) => {
                    y *= dir;
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, 5, 0, TAU);
                });
            }
            ctx.fill();
        }
    }
}
exports.default = MobRendererBeetle;
