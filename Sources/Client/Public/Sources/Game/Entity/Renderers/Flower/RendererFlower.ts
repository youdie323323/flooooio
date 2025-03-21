import type Player from "../../Player";
import Renderer from "../Renderer";
import type { RenderingContext } from "../RendererRenderingContext";
import RendererFlowerDev from "./RendererFlowerDev";
import RendererFlowerNormal from "./RendererFlowerNormal";

export default class RendererFlower extends Renderer<Player> {
    private dev: RendererFlowerDev = new RendererFlowerDev();
    private normal: RendererFlowerNormal = new RendererFlowerNormal();

    override render(context: RenderingContext<Player>): void {
        super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 25;
        ctx.scale(scale, scale);

        if (entity.isDev) {
            this.dev.render(context);
        } else {
            this.normal.render(context);
        }
    }
}