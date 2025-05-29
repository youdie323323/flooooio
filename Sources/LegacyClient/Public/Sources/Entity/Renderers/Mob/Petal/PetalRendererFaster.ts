import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

export default class PetalRendererFaster extends AbstractPetalRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBasicLike(context, 15, 4, "#feffc9", "#cecfa3");
    }
}