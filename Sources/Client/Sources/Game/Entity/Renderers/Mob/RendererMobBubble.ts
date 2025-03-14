import type Mob from "../../Mob";
import type { RenderContext } from "../RendererRenderingContext";
import RendererMobBase from "./RendererMobBase";

export default class RendererMobBubble extends RendererMobBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBubble(context, false);
    }
}