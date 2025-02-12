import { darkend, DARKEND_BASE } from "../../../Utils/common";
import Mob from "../../Mob";
import type { RendererRenderingContext } from "../RendererRenderingContext";
import RendererMobBase from "./RendererMobBase";

const TAU = Math.PI * 2;

export default class RendererMobStarfish extends RendererMobBase {
    override render(context: RendererRenderingContext<Mob>): void {
        // Non-recursive renderer
        // super.render(context);

        const { ctx, entity } = context;

        const scale = entity.size / 80;
        ctx.scale(scale, scale);

        ctx.rotate(Date.now() / 2000 % TAU + entity.moveCounter * 0.4);

        const { STARFISH_LEG_AMOUNT } = Mob;

        const legDistance = entity.legD;
        const remainingLegsCount = entity.isDead ? 0 : Math.floor(entity.nHealth * STARFISH_LEG_AMOUNT);

        ctx.beginPath();
        for (let i = 0; i < STARFISH_LEG_AMOUNT; i++) {
            const midAngle = (i + 0.5) / STARFISH_LEG_AMOUNT * TAU;
            const endAngle = (i + 1) / STARFISH_LEG_AMOUNT * TAU;
            legDistance[i] += ((i < remainingLegsCount ? 175 : 105) - legDistance[i]) * 0.5;
            const legLength = legDistance[i];
            if (i === 0) {
                ctx.moveTo(legLength, 0);
            }
            ctx.quadraticCurveTo(
                Math.cos(midAngle) * 15,
                Math.sin(midAngle) * 15,
                Math.cos(endAngle) * legLength,
                Math.sin(endAngle) * legLength
            );
        }
        ctx.closePath();
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.lineWidth = 52;
        ctx.strokeStyle = this.getSkinColor(context, darkend("#d0504e", DARKEND_BASE));
        ctx.stroke();
        ctx.lineWidth = 26;
        ctx.strokeStyle = ctx.fillStyle = this.getSkinColor(context, "#d0504e");
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < STARFISH_LEG_AMOUNT; i++) {
            const legRotation = i / STARFISH_LEG_AMOUNT * TAU;
            ctx.save();
            ctx.rotate(legRotation);
            const lengthRatio = legDistance[i] / 175;
            let spotPosition = 56;
            const SPOTS_PER_LEG = 3;
            for (let j = 0; j < SPOTS_PER_LEG; j++) {
                const spotSize = (1 - j / SPOTS_PER_LEG * 0.8) * 24 * lengthRatio;
                ctx.moveTo(spotPosition, 0);
                ctx.arc(spotPosition, 0, spotSize, 0, TAU);
                spotPosition += spotSize * 2 + lengthRatio * 5;
            }
            ctx.restore();
        }
        ctx.fillStyle = "#d3756b";
        ctx.fill();
    }
}