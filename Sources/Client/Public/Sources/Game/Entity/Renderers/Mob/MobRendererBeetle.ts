import { darkened, DARKENED_BASE } from "../../../../../../../Shared/Utils/Color";
import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = Math.PI * 2;

function createBeetleBodyPath() {
    const path = new Path2D();

    path.moveTo(0, -30);
    path.quadraticCurveTo(40, -30, 40, 0);
    path.quadraticCurveTo(40, 30, 0, 30);
    path.quadraticCurveTo(-40, 30, -40, 0);
    path.quadraticCurveTo(-40, -30, 0, -30);
    path.closePath();

    return path;
}

const beetleBodyPath = createBeetleBodyPath();

export default class MobRendererBeetle extends AbstractMobRenderer {
    override render(context: RenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        // Change angle
        ctx.rotate(entity.angle);

        const scale = entity.size / 40;
        ctx.scale(scale, scale);

        ctx.lineCap = ctx.lineJoin = "round";

        { // Draw beak
            ctx.lineWidth = 6;

            ctx.fillStyle = ctx.strokeStyle = "#333333";

            for (let dir = -1; dir <= 1; dir += 2) {
                ctx.save();

                ctx.translate(30, dir * 12);
                ctx.rotate(Math.sin(entity.moveCounter * 1.24) * 0.1 * dir);
                ctx.beginPath();
                ctx.moveTo(0, dir * 7);
                ctx.quadraticCurveTo(25, dir * 16, 40, 0);
                ctx.quadraticCurveTo(20, dir * 6, 0, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        }

        {
            ctx.lineWidth = 7;

            const skinColor =
                entity.isPet
                    ? "#ffe667"
                    : "#8f5db0";

            ctx.fillStyle = this.calculateDamageEffectColor(context, skinColor);
            ctx.fill(beetleBodyPath);
            // Arc points are same color with this
            ctx.fillStyle = ctx.strokeStyle = this.calculateDamageEffectColor(context, darkened(skinColor, DARKENED_BASE));
            ctx.stroke(beetleBodyPath);
        }

        { // Draw wrinkle
            ctx.lineWidth = 6;

            // Draw center line
            ctx.beginPath();
            ctx.moveTo(-21, 0);
            ctx.quadraticCurveTo(0, -3, 21, 0);
            ctx.lineCap = "round";
            ctx.stroke();

            const arcPoints = [[-17, -12], [17, -12], [0, -15]];

            ctx.beginPath();
            for (let i = 0; i < 2; i++) {
                const relative = i === 1 ? 1 : -1;
                for (let j = 0; j < arcPoints.length; j++) {
                    let [x, y] = arcPoints[j];
                    y *= relative;
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, 5, 0, TAU);
                }
            }
            ctx.fill();

            ctx.fill();
        }
    }
}