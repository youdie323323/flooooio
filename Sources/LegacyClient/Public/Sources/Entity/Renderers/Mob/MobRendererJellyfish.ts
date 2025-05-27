import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = 2 * Math.PI;

export default class MobRendererJellyfish extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity, isSpecimen } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        ctx.strokeStyle = ctx.fillStyle = this.calculateDamageEffectColor(context, "#ffffff");

        const oldGlobalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = oldGlobalAlpha * 0.6;

        ctx.lineCap = "round";
        ctx.lineWidth = 2.3;

        ctx.beginPath();

        for (let i = 0; i < 10; i++) {
            const tentacleAngle = i / 10 * TAU;
            const tentacleT =
                isSpecimen
                    ? 500
                    : Date.now();

            const tentacleMoveWave = Math.sin(tentacleAngle + tentacleT / 500);

            ctx.save();

            ctx.rotate(tentacleAngle);
            
            ctx.translate(17.5, 0);
            ctx.moveTo(0, 0);
            ctx.rotate(tentacleMoveWave * 0.5);
            ctx.quadraticCurveTo(4, tentacleMoveWave * -2, 14, 0);

            ctx.restore();
        }

        ctx.stroke();

        { // Body
            using _guard = this.guard(ctx);

            ctx.beginPath();

            ctx.arc(0, 0, 20, 0, TAU);

            ctx.globalAlpha = oldGlobalAlpha * 0.5;

            ctx.fill();

            ctx.clip();

            ctx.lineWidth = 3;

            ctx.stroke();
        }
    }
}