import Mob from "../../../Mob";
import type { RenderContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

export default class RendererPetalBasic extends RendererPetalBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBasicLike(context, "#ffffff", "#cfcfcf");
    }
}