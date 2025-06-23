"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Renderer_1 = __importDefault(require("../Renderer"));
class AbstractPlayerRenderer extends Renderer_1.default {
    static { this.DEAD_EYE_LENGTH = 4; }
    render(context) {
        // Non-recursive renderer
        // super.render(context);
    }
    drawDeadEyes({ ctx }, eyeX, eyeY) {
        const { DEAD_EYE_LENGTH } = AbstractPlayerRenderer;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(eyeX - DEAD_EYE_LENGTH, eyeY - DEAD_EYE_LENGTH);
        ctx.lineTo(eyeX + DEAD_EYE_LENGTH, eyeY + DEAD_EYE_LENGTH);
        ctx.moveTo(eyeX + DEAD_EYE_LENGTH, eyeY - DEAD_EYE_LENGTH);
        ctx.lineTo(eyeX - DEAD_EYE_LENGTH, eyeY + DEAD_EYE_LENGTH);
        ctx.stroke();
    }
}
exports.default = AbstractPlayerRenderer;
