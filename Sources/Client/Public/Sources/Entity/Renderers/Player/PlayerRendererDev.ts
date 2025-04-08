import type Player from "../../Player";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractPlayerRenderer from "./PlayerRenderer";

const TAU = Math.PI * 2;

export default class PlayerRendererDev extends AbstractPlayerRenderer {
    override render(context: RenderingContext<Player>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const {
            eyeX, eyeY,
            isDead,
            sadT, angryT,
        } = entity;

        { // Dev body
            ctx.save();

            ctx.lineCap = "round";

            ctx.fillStyle = '#ffe763';
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#cebb50';

            ctx.beginPath();

            ctx.moveTo(27, -0.5);
            ctx.quadraticCurveTo(19, 35, 4, 25.5);
            ctx.quadraticCurveTo(-21, 18, -23, 5);
            ctx.quadraticCurveTo(-27, -32, -1, -23);
            ctx.quadraticCurveTo(18, -24, 27, -0.5);

            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        if (isDead) {
            this.drawDeadEyes(context, 11, 8);
            this.drawDeadEyes(context, -10, -8);
        } else {
            using _guard = this.guard(ctx);

            ctx.beginPath();
            
            this.drawEyeOutline(context, 0.7);
            this.drawEyeOutline(context, 0);

            ctx.clip();

            ctx.beginPath();
            ctx.arc(11 + eyeX * 2, 8 + eyeY * 3.5, 3.1, 0, TAU);
            ctx.moveTo(-8, -5);
            ctx.arc(-10 + -eyeX * 2, -8 + -eyeY * 3.5, 3.1, 0, TAU);
            ctx.fillStyle = "#eee";
            ctx.fill();
        }

        const verticRise = angryT * -10.5 + sadT * -9;

        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;

        ctx.beginPath();

        ctx.translate(-7, 8);
        ctx.rotate(0.5);

        ctx.moveTo(-3, 0);
        ctx.quadraticCurveTo(0, 5.5 + verticRise, 3, 0);

        ctx.stroke();
    }

    private drawEyeOutline({ ctx }: RenderingContext<Player>, flag = 0) {
        ctx.beginPath();

        ctx.ellipse(11, 8, 2.5 + flag, 6 + flag, -0.15, 0, TAU);
        ctx.moveTo(-8, -5);
        ctx.ellipse(-10, -8, 2.5 + flag, 6 + flag, -0.15, 0, TAU);
        ctx.strokeStyle = ctx.fillStyle = "#111111";

        ctx.fill();
    }
}