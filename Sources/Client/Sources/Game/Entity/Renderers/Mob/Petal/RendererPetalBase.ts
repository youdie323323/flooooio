import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import type Mob from "../../../Mob";
import type { RenderContext } from "../../RendererRenderingContext";
import RendererMobBase from "../RendererMobBase";

const TAU = Math.PI * 2;

export default class RendererPetalBase extends RendererMobBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);
    }

    protected drawBasicLike(
        context: RenderContext<Mob>,
        fill: ColorCode,
        stroke: ColorCode,
    ): void {
        const { ctx, entity } = context;

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        ctx.fillStyle = this.getSkinColor(context, fill);
        ctx.fill();
        ctx.strokeStyle = this.getSkinColor(context, stroke);
        ctx.stroke();
    }
}