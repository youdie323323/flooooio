import type { ColorCode } from "../../../Utils/Color";
import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

export default class MobRendererSandstorm extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity, isSpecimen } = context;

        // Change angle
        // ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        const i =
            isSpecimen
                ? 0
                : entity.sandstormAngle++;

        const outerColor = this.calculateDamageEffectColor(context, (entity.isPet ? "#cb979c" : "#D5C7A6") satisfies ColorCode);
        const middleColor = this.calculateDamageEffectColor(context, (entity.isPet ? "#b18687" : "#BFB295") satisfies ColorCode);
        const innerColor = this.calculateDamageEffectColor(context, (entity.isPet ? "#9b7477" : "#A99E84") satisfies ColorCode);

        ctx.lineJoin = "round";
        ctx.lineWidth = 6;

        ctx.save();

        ctx.rotate(i * 0.02);

        ctx.rotate(Math.PI / 4);
        ctx.scale(-0.95, 0.95);

        ctx.fillStyle = ctx.strokeStyle = outerColor;
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(14, 24.24871253967285);
        ctx.lineTo(-14, 24.24871063232422);
        ctx.lineTo(-28, 0);
        ctx.lineTo(-14, -24.24871253967285);
        ctx.lineTo(14, -24.24871253967285);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        ctx.save();

        ctx.rotate(i * -0.03);

        ctx.fillStyle = ctx.strokeStyle = middleColor;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(9, 15.588458061218262);
        ctx.lineTo(-9, 15.588457107543945);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-9, -15.588458061218262);
        ctx.lineTo(9, -15.588458061218262);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        ctx.save();

        ctx.rotate(i * 0.04);

        ctx.fillStyle = ctx.strokeStyle = innerColor;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(4, 6.928203582763672);
        ctx.lineTo(-4, 6.928203105926514);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-4, -6.928203582763672);
        ctx.lineTo(4, -6.928203582763672);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}