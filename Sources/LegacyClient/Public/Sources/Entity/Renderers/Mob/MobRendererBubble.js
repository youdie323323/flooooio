"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MobRenderer_1 = __importDefault(require("./MobRenderer"));
class MobRendererBubble extends MobRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        this.drawBubble(context, 20, false);
    }
}
exports.default = MobRendererBubble;
