import { ColorCode } from "../../../../Utils/common";
import Mob from "../../../Mob";
import type { RenderContext } from "../../RendererRenderingContext";
import RendererPetalBase from "./RendererPetalBase";

const TAU = Math.PI * 2;

export default class RendererPetalYinYang extends RendererPetalBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        const clipFill = (us: ColorCode, ut: ColorCode) => {
            ctx.save();
            ctx.clip();
            ctx.lineCap = "round";
            ctx.fillStyle = this.getSkinColor(context, us);
            ctx.strokeStyle = this.getSkinColor(context, ut);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        clipFill("#333333", "#222222");
        ctx.rotate(Math.PI);
        ctx.beginPath();
        ctx.arc(0, 0, 20, -Math.PI / 2, Math.PI / 2);
        ctx.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
        ctx.arc(0, -10, 10, Math.PI / 2, Math.PI * 3 / 2, true);
        clipFill("#ffffff", "#cfcfcf");
        ctx.rotate(-Math.PI);
        ctx.beginPath();
        ctx.arc(0, 10, 10, Math.PI / 2, Math.PI * 3 / 2);
        clipFill("#333333", "#222222");
    }
}