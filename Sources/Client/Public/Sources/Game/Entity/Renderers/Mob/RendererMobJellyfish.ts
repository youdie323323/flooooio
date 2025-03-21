import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import RendererMobBase from "./RendererMobBase";

const TAU = Math.PI * 2;

export default class RendererMobJellyfish extends RendererMobBase {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 20;
        ctx.scale(scale, scale);

        const oldGlobalAlpha = ctx.globalAlpha;
        ctx.strokeStyle = ctx.fillStyle = this.getSkinColor(context, "#ffffff");
        ctx.globalAlpha = oldGlobalAlpha * 0.6;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const tentacleAngle = i / 10 * TAU;
            ctx.save();
            ctx.rotate(tentacleAngle);
            ctx.translate(17.5, 0);
            ctx.moveTo(0, 0);
            const tentacleMoveWave = Math.sin(tentacleAngle + Date.now() / 500);
            ctx.rotate(tentacleMoveWave * 0.5);
            ctx.quadraticCurveTo(4, tentacleMoveWave * -2, 14, 0);
            ctx.restore();
        }
        ctx.lineCap = "round";
        ctx.lineWidth = 2.3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, TAU);
        ctx.globalAlpha = oldGlobalAlpha * 0.5;
        ctx.fill();
        ctx.clip();
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}