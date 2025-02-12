import Mob from "../../Mob";
import type { RendererRenderingContext } from "../RendererRenderingContext";
import RendererMobBase from "./RendererMobBase";

export default class RendererMobBubble extends RendererMobBase {
    override render(context: RendererRenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBubble(context, false);
    }
}