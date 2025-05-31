import { MobType } from "../../../Native/Entity/EntityType";
import type { ColorCode } from "../../../Utils/Color";
import { darkened, DARKENED_BASE } from "../../../Utils/Color";
import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = 2 * Math.PI;

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
            const acolor = this.toEffectedColor(context, "#333333");

            ctx.fillStyle = ctx.strokeStyle = acolor;
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

        ctx.lineWidth = 7;
        ctx.lineJoin = ctx.lineCap = "round";

        ctx.beginPath();

        ctx.arc(0, 33, 18, 0, TAU);
        ctx.arc(0, -33, 18, 0, TAU);

        ctx.fillStyle = this.toEffectedColor(context, "#333333");

        ctx.fill();

        let bodyColor: ColorCode;

        switch (entity.type) {
            case MobType.CENTIPEDE_DESERT: {
                bodyColor = "#d3c66d";

                break;
            }

            case MobType.CENTIPEDE_EVIL: {
                bodyColor = "#8f5db0";

                break;
            }

            case MobType.CENTIPEDE: {
                bodyColor = "#8ac255";

                break;
            }
        }

        ctx.beginPath();

        ctx.arc(0, 0, 40, 0, TAU);

        ctx.fillStyle = this.toEffectedColor(context, bodyColor);
        ctx.fill();

        ctx.lineWidth = 8;
        ctx.strokeStyle = this.toEffectedColor(context, darkened(bodyColor, DARKENED_BASE));
        ctx.stroke();
    }
}