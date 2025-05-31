import type { ColorCode } from "../../../../Utils/Color";
import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractMobRenderer from "../MobRenderer";

const TAU = 2 * Math.PI;

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

        ctx.fillStyle = this.toEffectedColor(context, fillColor);
        ctx.strokeStyle = this.toEffectedColor(context, strokeColor);
        ctx.fill();
        ctx.stroke();
    }
}