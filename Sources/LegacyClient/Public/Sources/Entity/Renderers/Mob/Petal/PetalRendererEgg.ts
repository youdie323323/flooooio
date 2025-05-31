import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

const TAU = 2 * Math.PI;

export default class PetalRendererEgg extends AbstractPetalRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.lineWidth = 6;

        ctx.beginPath();
        
        ctx.ellipse(0, 0, 30, 40, 0, 0, TAU);

        ctx.fillStyle = this.toEffectedColor(context, "#fff0b8");
        ctx.strokeStyle = this.toEffectedColor(context, "#cfc295");
        ctx.fill();
        ctx.stroke();
    }
}