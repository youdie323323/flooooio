import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkened, DARKENED_BASE } from "../../../../../../../Shared/Utils/Color";
import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = Math.PI * 2;

export default class MobRendererBee extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const bcolor = this.calculateDamageEffectColor(context, "#333333");
        const fcolor = "#ffe763" satisfies ColorCode;
        const scolor = darkened(fcolor, DARKENED_BASE);

        const scale = entity.size / 30;
        ctx.scale(scale, scale);

        ctx.lineJoin = ctx.lineCap = "round";
        ctx.lineWidth = 5;

        { // Stinger
            ctx.fillStyle = "#333333";
            ctx.strokeStyle = this.calculateDamageEffectColor(context, darkened("#333333", DARKENED_BASE));

            ctx.beginPath();
            ctx.moveTo(-37, 0);
            ctx.lineTo(-25, -9);
            ctx.lineTo(-25, 9);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
        ctx.fillStyle = fcolor;
        ctx.fill();

        { // Body stripes
            using _guard = this.guard(ctx);

            ctx.clip();
            ctx.fillStyle = bcolor;
            ctx.fillRect(10, -20, 10, 40);
            ctx.fillRect(-10, -20, 10, 40);
            ctx.fillRect(-30, -20, 10, 40);
        }

        // Body outline
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
        ctx.strokeStyle = scolor;
        ctx.stroke();

        { // Antennas
            ctx.strokeStyle = ctx.fillStyle = bcolor;
            ctx.lineWidth = 3;

            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 5 * dir);
                ctx.quadraticCurveTo(35, 5 * dir, 40, 15 * dir);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(40, 15 * dir, 5, 0, TAU);
                ctx.fill();
            }
        }
    }
}