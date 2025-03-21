import Renderer from "../Renderer";
import type Player from "../../Player";
import type { RenderingContext } from "../RendererRenderingContext";

export default class RendererFlowerBase extends Renderer<Player> {
    override render(context: RenderingContext<Player>): void {
        // Non-recursive renderer
        // super.render(context);
    }

    protected drawDeadEyes({ ctx }: RenderingContext<Player>, eyeX: number, eyeY: number) {
        const OFFSET = 4;

        ctx.beginPath();

        ctx.moveTo(eyeX - OFFSET, eyeY - OFFSET);
        ctx.lineTo(eyeX + OFFSET, eyeY + OFFSET);
        ctx.moveTo(eyeX + OFFSET, eyeY - OFFSET);
        ctx.lineTo(eyeX - OFFSET, eyeY + OFFSET);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.closePath();
    }
}
