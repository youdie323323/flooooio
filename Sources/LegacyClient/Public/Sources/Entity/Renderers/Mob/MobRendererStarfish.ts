import { darkened, DARKENED_BASE } from "../../../Utils/Color";
import type Mob from "../../Mob";
import type { RenderingContext } from "../RendererRenderingContext";
import AbstractMobRenderer from "./MobRenderer";

const TAU = 2 * Math.PI;

export default class MobRendererStarfish extends AbstractMobRenderer {
    public static readonly STARFISH_LEG_AMOUNT = 5 as const;

    public static readonly UNDESTROYED_LEG_DISTANCE = 175 as const;
    public static readonly DESTROYED_LEG_DISTANCE = 100 as const;

    private static readonly DISTANCE_LERP_FACTOR = 0.2 as const;

    private static readonly SPOTS_PER_LEG = 3 as const;

    override render(context: RenderingContext<Mob>): void {
        const { ctx, entity, isSpecimen } = context;

        const { STARFISH_LEG_AMOUNT, UNDESTROYED_LEG_DISTANCE, DESTROYED_LEG_DISTANCE, DISTANCE_LERP_FACTOR, SPOTS_PER_LEG } = MobRendererStarfish;

        ctx.rotate(entity.angle);

        const scale = entity.size / 120;
        ctx.scale(scale, scale);

        const rotation = (
            isSpecimen
                ? 2000
                : Date.now()
        ) / 2000 % TAU + entity.moveCounter * 0.4;
        ctx.rotate(rotation);

        const legDistance = entity.legD;
        
        const remainingLegAmount =
            isSpecimen
                ? STARFISH_LEG_AMOUNT
                : entity.isDead
                    ? 0
                    : Math.round(
                        // Use pure health value (0 ~ 1)
                        entity.nHealth *
                        STARFISH_LEG_AMOUNT,
                    );

        ctx.beginPath();

        for (let i = 0; i < STARFISH_LEG_AMOUNT; i++) {
            const midAngle = (i + 0.5) / STARFISH_LEG_AMOUNT * TAU;
            const endAngle = (i + 1) / STARFISH_LEG_AMOUNT * TAU;

            const oldDistance = legDistance[i];

            legDistance[i] = oldDistance + (
                (
                    i < remainingLegAmount
                        ? UNDESTROYED_LEG_DISTANCE
                        : DESTROYED_LEG_DISTANCE
                ) - oldDistance
            ) * DISTANCE_LERP_FACTOR;

            const distance = legDistance[i];

            if (i === 0) {
                ctx.moveTo(distance, 0);
            }

            ctx.quadraticCurveTo(
                Math.cos(midAngle) * 15,
                Math.sin(midAngle) * 15,
                Math.cos(endAngle) * distance,
                Math.sin(endAngle) * distance,
            );
        }

        ctx.lineCap = ctx.lineJoin = "round";

        ctx.lineWidth = 52;
        ctx.strokeStyle = this.calculateDamageEffectColor(context, darkened("#d0504e", DARKENED_BASE));
        ctx.stroke();

        ctx.lineWidth = 26;
        ctx.strokeStyle = ctx.fillStyle = this.calculateDamageEffectColor(context, "#d0504e");
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();

        for (let i = 0; i < STARFISH_LEG_AMOUNT; i++) {
            const lengthRatio = legDistance[i] / UNDESTROYED_LEG_DISTANCE;
            const legRotation = i / STARFISH_LEG_AMOUNT * TAU;

            const numSpots =
                lengthRatio > 0.9999
                    ? SPOTS_PER_LEG
                    : 1;

            let spotPosition = 52;

            ctx.save();

            ctx.rotate(legRotation);

            for (let j = 0; j < numSpots; j++) {
                const spotSize = (1 - j / SPOTS_PER_LEG * 0.8) * 24;

                ctx.moveTo(spotPosition, 0);
                ctx.arc(spotPosition, 0, spotSize, 0, TAU);

                spotPosition += spotSize * 2 + lengthRatio * 5;
            }

            ctx.restore();
        }

        ctx.fillStyle = this.calculateDamageEffectColor(context, "#d3756b");
        ctx.fill();
    }
}