import Mob from "../../../Mob";
import type { RenderContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

export default class RendererPetalFaster extends RendererPetalBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBasicLike(context, "#feffc9", "#cecfa3");
    }
}