"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Renderer_1 = __importDefault(require("../Renderer"));
const PlayerRendererDev_1 = __importDefault(require("./PlayerRendererDev"));
const PlayerRendererNormal_1 = __importDefault(require("./PlayerRendererNormal"));
class PlayerRendererDispatcher extends Renderer_1.default {
    static { this.dev = new PlayerRendererDev_1.default(); }
    static { this.normal = new PlayerRendererNormal_1.default(); }
    render(context) {
        super.render(context);
        const { ctx, entity } = context;
        const scale = entity.size / 25;
        ctx.scale(scale, scale);
        if (entity.isDev) {
            PlayerRendererDispatcher.dev.render(context);
        }
        else {
            PlayerRendererDispatcher.normal.render(context);
        }
    }
}
exports.default = PlayerRendererDispatcher;
