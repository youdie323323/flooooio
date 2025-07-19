import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

export default class PetalRendererSand extends AbstractPetalRenderer {
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
        ctx.lineTo(3.5, 6.062178134918213);
        ctx.lineTo(-3.5, 6.062177658081055);
        ctx.lineTo(-7, -6.119594218034763e-7);
        ctx.lineTo(-3.5, -6.062178134918213);
        ctx.lineTo(3.5, -6.062178134918213);

        ctx.closePath();
        
        ctx.lineWidth = 3;
        ctx.fillStyle = this.toEffectedColor(context, "#E0C85C");
        ctx.strokeStyle = this.toEffectedColor(context, "#B5A24B");
        ctx.fill();
        ctx.stroke();
    }
}