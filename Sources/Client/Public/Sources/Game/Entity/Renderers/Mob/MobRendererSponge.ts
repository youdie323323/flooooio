import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = Math.PI * 2;

export default class MobRendererSponge extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        ctx.fillStyle = "#efc99b";
        ctx.fill();
        ctx.strokeStyle = "#c1a37d";
        ctx.stroke();
        ctx.closePath();
    }
}