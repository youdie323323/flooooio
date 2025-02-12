import { ColorCode } from "../../../../Utils/common";
import Mob from "../../../Mob";
import type { RendererRenderingContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

export default class RendererPetalFaster extends RendererPetalBase {
    override render(context: RendererRenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        this.drawBasicLike(context, "#feffc9", "#cecfa3");
    }
}