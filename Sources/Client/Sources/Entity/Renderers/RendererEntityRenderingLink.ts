import Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import Renderer from "./Renderer";
import RendererFlower from "./RendererFlower/RendererFlower";
import RendererMob from "./RendererMob/RendererMob";
import { RendererRenderingContext } from "./RendererRenderingContext";

const rendererMap = new Map<typeof Player | typeof Mob, Renderer<Entity>>();

// TODO: use decorator to dynamically determine which renderer to use on entity class
rendererMap.set(Player, new RendererFlower());
rendererMap.set(Mob, new RendererMob());

export function rendererOf<T extends Mob | Player>(entity: T) {
    return rendererMap.get(entity.constructor as typeof Player | typeof Mob);
}

export function renderEntity<T extends Mob | Player>(ctx: CanvasRenderingContext2D, entity: T): void {
    const renderer = rendererOf(entity);
    if (!renderer) return;

    const renderingContext = {
        ctx,
        entity,
    } satisfies RendererRenderingContext<T>;

    if (!renderer.isRenderCandidate(renderingContext)) return;

    ctx.save();
    renderer.render(renderingContext);
    ctx.restore();
}