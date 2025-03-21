import type Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import RendererFlower from "./Flower/RendererFlower";
import RendererMob from "./Mob/RendererMob";
import type Renderer from "./Renderer";
import type { RenderingContext } from "./RendererRenderingContext";

const rendererRegistry = new Map<Function, Renderer<Entity>>();

rendererRegistry.set(Player, new RendererFlower());
rendererRegistry.set(Mob, new RendererMob());

/**
 * @deprecated Impossible to use because of circular deps
 */
export function UseRenderer(renderer: typeof Renderer<Entity>) {
    return function (target: Function) {
        rendererRegistry.set(target, new renderer());
    };
}

export function getRenderer(entityClass: Function): Renderer<Entity> {
    return rendererRegistry.get(entityClass);
}

export function renderEntity<T extends Mob | Player>(renderingContext: RenderingContext<T>): void {
    const { entity, ctx } = renderingContext;

    const renderer = getRenderer(entity.constructor);
    if (!renderer) return;

    if (!renderer.isRenderingCandidate(renderingContext)) return;

    ctx.save();

    renderer.render(renderingContext);

    ctx.restore();
}