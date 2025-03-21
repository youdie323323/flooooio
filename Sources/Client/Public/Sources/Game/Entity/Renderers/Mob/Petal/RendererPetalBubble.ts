import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

export default class RendererPetalBubble extends RendererPetalBase {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBubble(context, true);
    }
}