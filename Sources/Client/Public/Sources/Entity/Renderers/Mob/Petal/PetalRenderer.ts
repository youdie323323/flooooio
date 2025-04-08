import type { ColorCode } from "../../../../Utils/Color";
import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractMobRenderer from "../MobRenderer";

const TAU = Math.PI * 2;

export default abstract class AbstractPetalRenderer extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);
    }

    protected drawBasicLike(
        context: RenderingContext<Mob>,
        fill: ColorCode,
        stroke: ColorCode,
    ): void {
        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, TAU);
        ctx.fillStyle = this.calculateDamageEffectColor(context, fill);
        ctx.fill();
        ctx.strokeStyle = this.calculateDamageEffectColor(context, stroke);
        ctx.stroke();
    }
}