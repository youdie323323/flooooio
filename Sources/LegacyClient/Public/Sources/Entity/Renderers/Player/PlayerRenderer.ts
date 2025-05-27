import Renderer from "../Renderer";
import type Player from "../../Player";
import type { RenderingContext } from "../RendererRenderingContext";

export default class AbstractPlayerRenderer extends Renderer<Player> {
    private static readonly DEAD_EYE_LENGTH = 4 as const;

    override render(context: RenderingContext<Player>): void {
        // Non-recursive renderer
        // super.render(context);
    }

    protected drawDeadEyes({ ctx }: RenderingContext<Player>, eyeX: number, eyeY: number) {
        const { DEAD_EYE_LENGTH } = AbstractPlayerRenderer;

        ctx.lineCap = "round";

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";

        ctx.beginPath();

        ctx.moveTo(eyeX - DEAD_EYE_LENGTH, eyeY - DEAD_EYE_LENGTH);
        ctx.lineTo(eyeX + DEAD_EYE_LENGTH, eyeY + DEAD_EYE_LENGTH);
        ctx.moveTo(eyeX + DEAD_EYE_LENGTH, eyeY - DEAD_EYE_LENGTH);
        ctx.lineTo(eyeX - DEAD_EYE_LENGTH, eyeY + DEAD_EYE_LENGTH);

        ctx.stroke();
    }
}
