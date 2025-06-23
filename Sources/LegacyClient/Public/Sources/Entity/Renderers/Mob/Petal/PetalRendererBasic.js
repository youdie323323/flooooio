"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PetalRenderer_1 = __importDefault(require("./PetalRenderer"));
class PetalRendererBasic extends PetalRenderer_1.default {
    render(context) {
        // Non-recursive renderer
        // super.render(context);
        this.drawBasicLike(context, 15, 5, "#ffffff", "#cfcfcf");
    }
}
exports.default = PetalRendererBasic;
