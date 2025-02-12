import { MobType } from "../../../../../Shared/EntityType";
import { ColorCode, darkend, DARKEND_BASE } from "../../../Utils/common";
import Mob from "../../Mob";
import type { RenderContext } from "../RendererRenderingContext";
import RendererMobBase from "./RendererMobBase";

const TAU = Math.PI * 2;

export default class RendererMobCentipede extends RendererMobBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 40;
        ctx.scale(scale, scale);

        ctx.beginPath();
        for (let i = 0; i < 2; i++) {
            ctx.save();
            ctx.scale(1, i * 2 - 1);
            ctx.translate(0, -3);
            ctx.arc(0, 36, 18, 0, TAU);
            ctx.restore();
        }
        ctx.lineWidth = 7;
        ctx.lineJoin = ctx.lineCap = "round";
        ctx.strokeStyle = ctx.fillStyle = this.getSkinColor(context, "#333333");
        ctx.fill();

        let bodyColor: ColorCode;
        if (entity.type === MobType.CentipedeDesert) {
            bodyColor = "#d3c66d";
        } else if (entity.type === MobType.CentipedeEvil) {
            bodyColor = "#8f5db0";
        } else {
            bodyColor = "#8ac255";
        }

        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, TAU);
        ctx.fillStyle = this.getSkinColor(context, bodyColor);
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = this.getSkinColor(context, darkend(bodyColor, DARKEND_BASE));
        ctx.stroke();

        // Antennas
        if (entity.isFirstSegment) {
            const acolor = this.getSkinColor(context, "#333333");

            ctx.strokeStyle = acolor;
            ctx.fillStyle = acolor;
            ctx.lineWidth = 3;
            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.beginPath();
                ctx.moveTo(25, 10.21 * dir);
                ctx.quadraticCurveTo(47.54, 11.62 * dir, 55.28, 30.63 * dir);
                ctx.stroke()

                ctx.beginPath();
                ctx.arc(55.28, 30.63 * dir, 5, 0, TAU);
                ctx.fill();
            }
        }
    }
}