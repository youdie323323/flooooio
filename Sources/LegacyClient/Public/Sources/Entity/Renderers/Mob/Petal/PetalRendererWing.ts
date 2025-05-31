import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

const PI2 = Math.PI / 2;

export default class PetalRendererWing extends AbstractPetalRenderer {
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

        ctx.arc(0, 0, 15, -PI2, PI2, false);
        ctx.quadraticCurveTo(10, 0, 0, -15);

        ctx.closePath();

        ctx.fillStyle = this.toEffectedColor(context, "#FFFFFF");
        ctx.strokeStyle = this.toEffectedColor(context, "#CFCFCF");
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
    }
}