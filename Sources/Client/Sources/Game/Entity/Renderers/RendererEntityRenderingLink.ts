import Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import Renderer from "./Renderer";
import RendererFlower from "./RendererFlower/RendererFlower";
import RendererMob from "./RendererMob/RendererMob";
import { RenderContext } from "./RendererRenderingContext";

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

export function renderEntity<T extends Mob | Player>(ctx: CanvasRenderingContext2D, entity: T): void {
    const renderer = getRenderer(entity.constructor);
    if (!renderer) return;

    if (!renderer.isEntityRenderCandidate(entity)) return;

    const renderingContext = {
        ctx,
        entity,
    } satisfies RenderContext<T>;

    ctx.save();

    renderer.render(renderingContext);

    ctx.restore();
}