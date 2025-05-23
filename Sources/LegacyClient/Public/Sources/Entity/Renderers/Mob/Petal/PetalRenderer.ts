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
        fraction: number,
        strokeWidth: number,
        fillColor: ColorCode,
        strokeColor: ColorCode,
    ): void {
        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / fraction;
        ctx.scale(scale, scale);

        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, TAU);
        ctx.fillStyle = this.calculateDamageEffectColor(context, fillColor);
        ctx.fill();
        ctx.strokeStyle = this.calculateDamageEffectColor(context, strokeColor);
        ctx.stroke();
    }
}