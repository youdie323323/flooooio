import Mob from "../../Mob";
import Renderer from "../Renderer";
import type { RenderContext } from "../RendererRenderingContext";

const TAU = Math.PI * 2;

export default class RendererMobBase extends Renderer<Mob> {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);
    }

    protected drawBubble(context: RenderContext<Mob>, isPetal: boolean) {
        const { ctx, entity } = context;

        const scale = entity.size / 15;
        ctx.scale(scale, scale);

        const oldGlobalAlpha = ctx.globalAlpha;
        ctx.strokeStyle = ctx.fillStyle = this.getSkinColor(context, "#ffffff");
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