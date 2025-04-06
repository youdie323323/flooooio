import { MobType } from "../../../../../../../Shared/Entity/Statics/EntityType";
import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkened, DARKENED_BASE } from "../../../../../../../Shared/Utils/Color";
import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = Math.PI * 2;

export default class MobRendererCentipede extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 40;
        ctx.scale(scale, scale);

        this.drawCentiBody(context);

        // Antennas
        if (entity.isFirstSegment) {
            const acolor = this.calculateDamageEffectColor(context, "#333333");

            ctx.strokeStyle = acolor;
            ctx.fillStyle = acolor;
            ctx.lineWidth = 3;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 10.21 * dir);
                ctx.quadraticCurveTo(47.54, 11.62 * dir, 55.28, 30.63 * dir);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(55.28, 30.63 * dir, 5, 0, TAU);
                ctx.fill();
            }
        }
    }

    private drawCentiBody(context: RenderingContext<Mob>): void {
        const { ctx, entity } = context;

        ctx.beginPath();
        ctx.arc(0, 33, 18, 0, TAU);
        ctx.arc(0, -33, 18, 0, TAU);
        ctx.lineWidth = 7;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.strokeStyle = ctx.fillStyle = this.calculateDamageEffectColor(context, "#333333");
        ctx.fill();

        let bodyColor: ColorCode;
        if (entity.type === MobType.CENTIPEDE_DESERT) {
            bodyColor = "#d3c66d";
        } else if (entity.type === MobType.CENTIPEDE_EVIL) {
            bodyColor = "#8f5db0";
        } else {
            bodyColor = "#8ac255";
        }

        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, TAU);
        ctx.fillStyle = this.calculateDamageEffectColor(context, bodyColor);
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.calculateDamageEffectColor(context, darkened(bodyColor, DARKENED_BASE));
        ctx.stroke();
    }
}