import type Player from "../../Player";
import type { RenderContext } from "../RendererRenderingContext";
import RendererFlowerBase from "./RendererFlowerBase";

const TAU = Math.PI * 2;

export default class RendererFlowerNormal extends RendererFlowerBase {
    override render(context: RenderContext<Player>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const {
            eyeX, eyeY,
            isDead,
            sadT, angryT,
        } = entity;

        // Normal body
        {
            ctx.fillStyle = this.getSkinColor(context, "#ffe763");
            ctx.lineWidth = 2.75;
            ctx.strokeStyle = this.getSkinColor(context, "#cfbb50");
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, TAU);
            ctx.fill();
            ctx.stroke();
        }

        const angerOffset = angryT * 6;

        if (isDead) {
            this.drawDeadEyes(context, 7, -5);
            this.drawDeadEyes(context, -7, -5);
        } else {
            ctx.save();

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
            ctx.fillStyle = "#eee";
            ctx.fill();

            ctx.restore();
        }

        const verticRise = angryT * -10.5 + sadT * -9;

        ctx.beginPath();
        ctx.translate(0, 9.7);
        ctx.moveTo(-6.1, 0);
        ctx.quadraticCurveTo(0, 5.5 + verticRise, 6.1, 0);
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    private drawEyeShape(
        { ctx }: RenderContext<Player>,
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

    private drawEyeOutline({ ctx }: RenderContext<Player>, flag = 0) {
        ctx.beginPath();

        ctx.ellipse(7, -5, 2.5 + flag, 6 + flag, 0, 0, TAU);
        ctx.moveTo(-7, -5);
        ctx.ellipse(-7, -5, 2.5 + flag, 6 + flag, 0, 0, TAU);
        ctx.strokeStyle = ctx.fillStyle = "#111111";

        ctx.fill();
    }
}