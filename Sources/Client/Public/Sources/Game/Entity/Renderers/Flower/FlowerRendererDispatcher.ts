import type Player from "../../Player";
import Renderer from "../Renderer";
import type { RenderingContext } from "../RendererRenderingContext";
import FlowerRendererDev from "./FlowerRendererDev";
import FlowerRendererNormal from "./FlowerRendererNormal";

export default class FlowerRendererDispatcher extends Renderer<Player> {
    private dev: FlowerRendererDev = new FlowerRendererDev();
    private normal: FlowerRendererNormal = new FlowerRendererNormal();

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