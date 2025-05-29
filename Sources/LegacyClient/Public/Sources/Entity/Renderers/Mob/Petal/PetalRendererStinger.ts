import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

export default class PetalRendererStinger extends AbstractPetalRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 10;
        ctx.scale(scale, scale);

        ctx.lineJoin = "round";

        ctx.beginPath();

        ctx.moveTo(7, 0);
        ctx.lineTo(-3.500000476837158, 6.062177658081055);
        ctx.lineTo(-3.4999992847442627, -6.062178134918213);

        ctx.closePath();

        ctx.fillStyle = this.calculateDamageEffectColor(context, "#333333");
        ctx.strokeStyle = this.calculateDamageEffectColor(context, "#292929");
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
    }
}