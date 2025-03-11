import Mob from "../../Mob";
import type { RenderContext } from "../RendererRenderingContext";
import RendererMobBase from "./RendererMobBase";

const TAU = Math.PI * 2;

interface CurveData {
    dir: number;
    start: [number, number];
    curve: [number, number, number, number];
}

const curves: CurveData[] = [];

function createCurve(angle: number, direction: number, offset: number = 8): void {
    direction *= -1;
    
    const cosAngle: number = Math.cos(angle);
    const sinAngle: number = Math.sin(angle);
    const startX: number = cosAngle * 40;
    const startY: number = sinAngle * 40;

    curves.push({
        dir: direction,
        start: [startX, startY],
        curve: [
            startX + cosAngle * 23 + -sinAngle * direction * offset,
            startY + sinAngle * 23 + cosAngle * direction * offset,
            startX + cosAngle * 46,
            startY + sinAngle * 46,
        ],
    } satisfies CurveData);
}

createCurve((Math.PI / 180) * 45, 1);
createCurve((Math.PI / 180) * 75, 1, 6);
createCurve((Math.PI / 180) * 105, -1, 6);
createCurve((Math.PI / 180) * 135, -1);
createCurve((-Math.PI / 180) * 45, -1);
createCurve((-Math.PI / 180) * 75, -1, 6);
createCurve((-Math.PI / 180) * 105, 1, 6);
createCurve((-Math.PI / 180) * 135, 1);

export default class RendererMobSpider extends RendererMobBase {
    override render(context: RenderContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 40;
        ctx.scale(scale, scale);

        // Draw legs
        {
            for (let i = 0; i < curves.length; i++) {
                const curve = curves[i];
                ctx.save();
                ctx.rotate(curve.dir * Math.sin(entity.moveCounter + i) * 0.15);
                ctx.beginPath();
                ctx.moveTo(...curve.start);
                ctx.quadraticCurveTo(...curve.curve);
                ctx.strokeStyle = this.getSkinColor(context, "#323032");
                ctx.lineWidth = 10;
                ctx.lineCap = "round";
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.fillStyle = this.getSkinColor(context, "#4f412e");
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, TAU);
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.stroke();
        ctx.restore();
    }
}