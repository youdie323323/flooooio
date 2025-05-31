import type Player from "../../Player";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractPlayerRenderer from "./PlayerRenderer";

const TAU = 2 * Math.PI;

export default class PlayerRendererNormal extends AbstractPlayerRenderer {
    override render(context: RenderingContext<Player>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const {
            eyeX, eyeY,
            isDead,
            sadT, angryT,
        } = entity;

        ctx.lineCap = "round";

        { // Normal body
            ctx.beginPath();

            ctx.arc(0, 0, 25, 0, TAU);

            ctx.lineWidth = 2.75;
            ctx.fillStyle = this.toEffectedColor(context, "#ffe763");
            ctx.strokeStyle = this.toEffectedColor(context, "#cfbb50");
            ctx.fill();
            ctx.stroke();
        }

        const angerOffset = angryT * 6;

        if (isDead) {
            this.drawDeadEyes(context, 7, -5);
            this.drawDeadEyes(context, -7, -5);
        } else {
            using _guard = this.guard(ctx);

            ctx.beginPath();

            this.drawEyeShape(context, 7, -5, 3.5999999999999996, 7.3, angerOffset, 1);
            this.drawEyeShape(context, -7, -5, 3.5999999999999996, 7.3, angerOffset, 0);

            ctx.clip();

            this.drawEyeOutline(context, 0.7);
            this.drawEyeOutline(context, 0);

            ctx.clip();

            ctx.beginPath();

            ctx.arc(7 + eyeX * 2, -5 + eyeY * 3.5, 3.1, 0, TAU);
            ctx.moveTo(-7, -5);
            ctx.arc(-7 + eyeX * 2, -5 + eyeY * 3.5, 3.1, 0, TAU);

            ctx.fillStyle = "#EEE";
            ctx.fill();
        }

        const verticRise = angryT * -10.5 + sadT * -9;

        ctx.beginPath();

        ctx.translate(0, 9.7);
        ctx.moveTo(-6.1, 0);
        ctx.quadraticCurveTo(0, 5.5 + verticRise, 6.1, 0);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    private drawEyeShape(
        { ctx }: RenderingContext<Player>,
        centerX: number, centerY: number,
        widthRadius: number, heightRadius: number,
        angerOffset: number,
        flag = 0,
    ) {
        const flippedFlag = flag ^ 1;

        ctx.moveTo(centerX - widthRadius, centerY - heightRadius + flag * angerOffset);
        ctx.lineTo(centerX + widthRadius, centerY - heightRadius + flippedFlag * angerOffset + flag);
        ctx.lineTo(centerX + widthRadius, centerY + heightRadius);
        ctx.lineTo(centerX - widthRadius, centerY + heightRadius);
        ctx.lineTo(centerX - widthRadius, centerY - heightRadius);
    }

    private drawEyeOutline({ ctx }: RenderingContext<Player>, flag = 0) {
        ctx.beginPath();

        ctx.ellipse(7, -5, 2.5 + flag, 6 + flag, 0, 0, TAU);
        ctx.moveTo(-7, -5);
        ctx.ellipse(-7, -5, 2.5 + flag, 6 + flag, 0, 0, TAU);

        ctx.strokeStyle = ctx.fillStyle = "#111111";
        ctx.fill();
    }
}