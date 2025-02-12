import { ColorCode } from "../../../../Utils/common";
import Mob from "../../../Mob";
import type { RenderContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

export default class RendererPetalBubble extends RendererPetalBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBubble(context, true);
    }
}