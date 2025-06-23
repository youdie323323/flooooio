"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../../../Utils/Color");
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const TAU = 2 * Math.PI;
class MobRendererBee extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 30;
        ctx.scale(scale, scale);
        const bcolor = this.toEffectedColor(context, "#333333");
        const fcolor = "#ffe763";
        const scolor = (0, Color_1.darkened)(fcolor, Color_1.DARKENED_BASE);
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.lineWidth = 5;
        { // Stinger
            ctx.fillStyle = bcolor;
            ctx.strokeStyle = this.toEffectedColor(context, (0, Color_1.darkened)("#333333", Color_1.DARKENED_BASE));
            ctx.beginPath();
            ctx.moveTo(-37, 0);
            ctx.lineTo(-25, -9);
            ctx.lineTo(-25, 9);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
        ctx.fillStyle = fcolor;
        ctx.fill();
        { // Body stripes
            using _guard = this.guard(ctx);
            ctx.clip();
            ctx.fillStyle = bcolor;
            ctx.fillRect(10, -20, 10, 40);
            ctx.fillRect(-10, -20, 10, 40);
            ctx.fillRect(-30, -20, 10, 40);
        }
        // Body outline
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
        ctx.strokeStyle = scolor;
        ctx.stroke();
        { // Antennas
            ctx.strokeStyle = ctx.fillStyle = bcolor;
            ctx.lineWidth = 3;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 5 * dir);
                ctx.quadraticCurveTo(35, 5 * dir, 40, 15 * dir);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(40, 15 * dir, 5, 0, TAU);
                ctx.fill();
            }
        }
    }
}
exports.default = MobRendererBee;
