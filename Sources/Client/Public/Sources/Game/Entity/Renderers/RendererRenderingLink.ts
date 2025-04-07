import type Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import FlowerRendererDispatcher from "./Flower/FlowerRendererDispatcher";
import MobRendererDispatcher from "./Mob/MobRendererDispatcher";
import type Renderer from "./Renderer";
import type { RenderingContext } from "./RendererRenderingContext";

const rendererDispatcherRegistry = new Map<Function, Renderer<Entity>>();

rendererDispatcherRegistry.set(Player, new FlowerRendererDispatcher());
rendererDispatcherRegistry.set(Mob, new MobRendererDispatcher());

/**
 * @deprecated Impossible to use because of circular deps
 */
export function UseRenderer(renderer: typeof Renderer<Entity>) {
    return function (target: Function) {
        rendererDispatcherRegistry.set(target, new renderer());
    };
}

export function getRenderer(entityClass: Function): Renderer<Entity> {
    return rendererDispatcherRegistry.get(entityClass);
}

export function renderEntity<T extends Mob | Player>(renderingContext: RenderingContext<T>): void {
    const { entity, ctx } = renderingContext;

    const renderer = getRenderer(entity.constructor);
    if (!(renderer && renderer.isRenderingCandidate(renderingContext))) return;

    ctx.save();

    renderer.render(renderingContext);

    ctx.restore();
}