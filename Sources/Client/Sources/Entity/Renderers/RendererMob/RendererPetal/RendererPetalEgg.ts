import { ColorCode } from "../../../../Utils/common";
import Mob from "../../../Mob";
import type { RenderContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

const TAU = Math.PI * 2;

export default class RendererPetalEgg extends RendererPetalBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 40, 0, 0, TAU);
        ctx.fillStyle = this.getSkinColor(context, "#fff0b8");
        ctx.fill();
        ctx.strokeStyle = this.getSkinColor(context, "#cfc295");
        ctx.stroke();
    }
}