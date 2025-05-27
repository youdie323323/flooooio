import type Mob from "../../Mob";
import Renderer from "../Renderer";
import type { RenderingContext } from "../RendererRenderingContext";

const TAU = 2 * Math.PI;

export default abstract class AbstractMobRenderer extends Renderer<Mob> {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);
    }

    protected drawBubble(context: RenderingContext<Mob>, isPetal: boolean) {
        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        const oldGlobalAlpha = ctx.globalAlpha;

        ctx.lineJoin = ctx.lineCap = "round";
        ctx.strokeStyle = ctx.fillStyle = this.calculateDamageEffectColor(context, "#ffffff");

        {
            ctx.beginPath();

            ctx.arc(10, 0, 2, 0, TAU);

            ctx.globalAlpha = oldGlobalAlpha * 0.4;
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        {
            ctx.beginPath();

            ctx.arc(0, 0, 20, 0, TAU);

            ctx.fill();
            ctx.clip();

            ctx.globalAlpha = oldGlobalAlpha * 0.5;
            ctx.lineWidth = isPetal ? 8 : 3;

            ctx.stroke();
        }
    }
}