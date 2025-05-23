import type { ColorCode } from "../../../../Utils/Color";
import type Mob from "../../../Mob";
import type { RenderingContext } from "../../RendererRenderingContext";
import AbstractPetalRenderer from "./PetalRenderer";

const TAU = Math.PI * 2;

const YIN_ANGLE_START = Math.PI / 2;

const YIN_ANGLE_END = Math.PI * 3 / 2;

export default class PetalRendererYinYang extends AbstractPetalRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        const clipFill = (fillColor: ColorCode, strokeColor: ColorCode) => {
            ctx.save();

            ctx.clip();
            ctx.lineCap = "round";
            ctx.fillStyle = this.calculateDamageEffectColor(context, fillColor);
            ctx.strokeStyle = this.calculateDamageEffectColor(context, strokeColor);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        };

        ctx.lineWidth = 6;

        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        clipFill("#333333", "#222222");
        ctx.rotate(Math.PI);

        ctx.beginPath();
        ctx.arc(0, 0, 20, -YIN_ANGLE_START, YIN_ANGLE_START);
        ctx.arc(0, 10, 10, YIN_ANGLE_START, YIN_ANGLE_END);
        ctx.arc(0, -10, 10, YIN_ANGLE_START, YIN_ANGLE_END, true);
        clipFill("#ffffff", "#cfcfcf");
        ctx.rotate(-Math.PI);
        
        ctx.beginPath();
        ctx.arc(0, 10, 10, YIN_ANGLE_START, YIN_ANGLE_END);
        clipFill("#333333", "#222222");
    }
}