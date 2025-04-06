import type Mob from "../../Mob";
import Renderer from "../Renderer";
import type { RenderingContext } from "../RendererRenderingContext";

const TAU = Math.PI * 2;

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
        ctx.strokeStyle = ctx.fillStyle = this.calculateDamageEffectColor(context, "#ffffff");
        ctx.globalAlpha = oldGlobalAlpha * 0.4;

        ctx.save();

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.arc(10, 0, 2, 0, TAU);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        ctx.fill();
        ctx.clip();
        ctx.globalAlpha = oldGlobalAlpha * 0.5;
        ctx.lineWidth = isPetal ? 8 : 3;
        ctx.stroke();
    }
}