"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseRenderer = UseRenderer;
exports.getRenderer = getRenderer;
exports.renderEntity = renderEntity;
const Mob_1 = __importDefault(require("../Mob"));
const Player_1 = __importDefault(require("../Player"));
const MobRendererDispatcher_1 = __importDefault(require("./Mob/MobRendererDispatcher"));
const PlayerRendererDispatcher_1 = __importDefault(require("./Player/PlayerRendererDispatcher"));
const rendererDispatcherRegistry = new Map();
rendererDispatcherRegistry.set(Player_1.default, new PlayerRendererDispatcher_1.default());
rendererDispatcherRegistry.set(Mob_1.default, new MobRendererDispatcher_1.default());
/**
 * @deprecated Impossible to use because of circular deps
 */
function UseRenderer(renderer) {
    return function (target) {
        rendererDispatcherRegistry.set(target, new renderer());
    };
}
function getRenderer(entityClass) {
    return rendererDispatcherRegistry.get(entityClass);
}
function renderEntity(renderingContext) {
    const { entity, ctx } = renderingContext;
    const renderer = getRenderer(entity.constructor);
    if (!(renderer && renderer.isRenderingCandidate(renderingContext)))
        return;
    ctx.save();
    renderer.render(renderingContext);
    ctx.restore();
}
