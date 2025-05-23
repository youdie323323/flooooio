import type Player from "../../Player";
import Renderer from "../Renderer";
import type { RenderingContext } from "../RendererRenderingContext";
import PlayerRendererDev from "./PlayerRendererDev";
import PlayerRendererNormal from "./PlayerRendererNormal";

export default class PlayerRendererDispatcher extends Renderer<Player> {
    private dev: PlayerRendererDev = new PlayerRendererDev();
    private normal: PlayerRendererNormal = new PlayerRendererNormal();

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