"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../../../Utils/Color");
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
const TAU = 2 * Math.PI;
class MobRendererCentipede extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        const { ctx, entity } = context;
        // Change angle
        ctx.rotate(entity.angle);
        const scale = entity.size / 40;
        ctx.scale(scale, scale);
        this.drawCentiBody(context);
        // Antennas
        if (entity.isFirstSegment) {
            const acolor = this.toEffectedColor(context, "#333333");
            ctx.fillStyle = ctx.strokeStyle = acolor;
            ctx.lineWidth = 3;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 10.21 * dir);
                ctx.quadraticCurveTo(47.54, 11.62 * dir, 55.28, 30.63 * dir);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(55.28, 30.63 * dir, 5, 0, TAU);
                ctx.fill();
            }
        }
    }
    drawCentiBody(context) {
        const { ctx, entity } = context;
        ctx.lineWidth = 7;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 33, 18, 0, TAU);
        ctx.arc(0, -33, 18, 0, TAU);
        ctx.fillStyle = this.toEffectedColor(context, "#333333");
        ctx.fill();
        let bodyColor;
        switch (entity.type) {
            case 17 /* MobType.CENTIPEDE_DESERT */: {
                bodyColor = "#d3c66d";
                break;
            }
            case 16 /* MobType.CENTIPEDE_EVIL */: {
                bodyColor = "#8f5db0";
                break;
            }
            case 15 /* MobType.CENTIPEDE */: {
                bodyColor = "#8ac255";
                break;
            }
        }
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, TAU);
        ctx.fillStyle = this.toEffectedColor(context, bodyColor);
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.toEffectedColor(context, (0, Color_1.darkened)(bodyColor, Color_1.DARKENED_BASE));
        ctx.stroke();
    }
}
exports.default = MobRendererCentipede;
