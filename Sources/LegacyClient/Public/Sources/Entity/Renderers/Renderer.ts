import UIGame from "../../UI/Game/UIGame";
import type Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import type { RenderingContext } from "./RendererRenderingContext";
import MOB_PROFILES from "../../../../../Shared/Florr/Native/ProfileData/mob_profiles.json";
import { uiCtx } from "../../../../Application";
import type { MobData } from "../../../../Private/Sources/Entity/Mob/MobData";
import type { ColorCode } from "../../Utils/Color";
import { memo } from "../../Utils/Memoize";
import { isPetal } from "../Petal";
import { MobType, PetalType } from "../../Native/Entity/EntityType";
import { setGameFont } from "../../UI/Layout/Components/WellKnown/StaticText";

type TupleColor = [number, number, number];

const hexToRgb = memo((hexColor: ColorCode): TupleColor => {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ];
});

function blendColor(
    [sr, sg, sb]: TupleColor,
    [tr, tg, tb]: TupleColor,

    t: number,
): TupleColor {
    const tInvert = 1 - t;

    return [
        (sr * t) + (tr * tInvert),
        (sg * t) + (tg * tInvert),
        (sb * t) + (tb * tInvert),
    ];
}

function blendColors(colors: Array<TupleColor>, t: number): TupleColor {
    const last = colors.length - 1;

    const segment = t * last;
    const index = Math.floor(segment);

    if (index >= last) return colors[last];

    return blendColor(colors[index], colors[index + 1], 1 - (segment - index));
}

const HURT_TARGET_COLOR_MIDDLE = [255, 0, 0] as const satisfies TupleColor;
const HURT_TARGET_COLOR_LAST = [255, 255, 255] as const satisfies TupleColor;

const POISON_TARGET_COLOR = [189, 80, 255] as const satisfies TupleColor;

export default class Renderer<T extends Entity> {
    private static readonly HP_BAR_MAX_WIDTH = 45 as const;

    /**
     * Render the entity.
     */
    public render(context: RenderingContext<T>): void {
        const { ctx, entity: { x, y }, isSpecimen } = context;

        ctx.translate(x, y);

        if (!isSpecimen) {
            this.applyDeathAnimation(context);

            this.drawEntityStatus(context);
        }
    }

    /**
     * Determine if entity should render.
     */
    public isRenderingCandidate({ entity, isSpecimen }: RenderingContext<T>): boolean {
        return !(
            !isSpecimen &&
            entity.isDead &&
            entity.deadT > 1
        );
    }

    /**
     * Context guard that protected rendering from clip.
     */
    protected guard(ctx: CanvasRenderingContext2D): Disposable {
        ctx.save();

        return { [Symbol.dispose]: () => { ctx.restore(); } };
    }

    /**
     * Change the color based on effects.
     */
    protected toEffectedColor({ entity: { hurtT, poisonT } }: RenderingContext<T>, color: ColorCode): string {
        // No effects to apply
        if (hurtT === 0 && poisonT === 0) return color;

        let sourceRgb = hexToRgb(color);

        // Apply additional colors

        if (poisonT > 0) sourceRgb = blendColor(sourceRgb, POISON_TARGET_COLOR, 0.75 * (1 - poisonT));

        const blended = blendColors([sourceRgb, HURT_TARGET_COLOR_MIDDLE, HURT_TARGET_COLOR_LAST], 0.95 * (1 - hurtT));

        const [r, g, b] = blendColor(sourceRgb, blended, 0.5);

        return `rgb(${r},${g},${b})`;
    }

    /**
     * Change scale and alpha if entity is dead.
     */
    protected applyDeathAnimation({ ctx, entity }: RenderingContext<T>) {
        const { isDead, deadT } = entity;

        if (isDead) {
            const isLeech = entity instanceof Mob && entity.type === MobType.LEECH;

            const sinWavedDeadT = Math.sin(deadT * Math.PI / (
                isLeech
                    ? 9
                    : 3
            ));

            const scale = 1 + sinWavedDeadT;

            ctx.scale(scale, scale);
            ctx.globalAlpha *= 1 - (isLeech ? 2 : 1) * sinWavedDeadT;
        }
    }

    protected drawEntityStatus({ ctx, entity }: RenderingContext<T>) {
        if (entity instanceof Mob && (isPetal(entity.type) || entity.type === MobType.MISSILE_PROJECTILE)) return;

        if (entity.hpAlpha <= 0) return;

        if (
            entity instanceof Player &&
            uiCtx.currentContext instanceof UIGame &&
            // Draw nickname if not self
            entity.id !== uiCtx.currentContext.waveSelfId
        ) {
            ctx.save();

            ctx.translate(0, -entity.size - 10);

            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            ctx.fillStyle = "#FFFFFF";
            setGameFont(ctx, 12);

            ctx.strokeText(entity.name, 0, 0);
            ctx.fillText(entity.name, 0, 0);

            ctx.restore();
        }

        const { HP_BAR_MAX_WIDTH } = Renderer;

        // Draw hp bar if health decreasing and living
        if (
            !entity.isDead &&
            1 > entity.health
        ) {
            ctx.save();

            let lineWidth: number;

            if (entity instanceof Player) {
                lineWidth = 5;

                ctx.translate(0, entity.size);
                ctx.translate(-HP_BAR_MAX_WIDTH / 2, 9 / 2 + 5);
            } else if (entity instanceof Mob) {
                lineWidth = 6.5;

                const { collision: { radius, fraction } }: MobData = MOB_PROFILES[entity.type];

                const scale = (entity.size * radius) / (15 * fraction);

                ctx.scale(scale, scale);
                ctx.translate(-HP_BAR_MAX_WIDTH / 2, 25);
            }

            ctx.lineCap = "round";
            ctx.globalAlpha = entity.hpAlpha;

            {
                ctx.beginPath();

                ctx.moveTo(0, 0);
                ctx.lineTo(HP_BAR_MAX_WIDTH, 0);

                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = "#222";
                ctx.stroke();
            }

            function setGlobalAlpha(hp: number) {
                ctx.globalAlpha = hp < 0.05 ? hp / 0.05 : 1;
            }

            if (entity.redHealth > 0) {
                setGlobalAlpha(entity.redHealth);

                ctx.beginPath();

                ctx.moveTo(0, 0);
                ctx.lineTo(HP_BAR_MAX_WIDTH * entity.redHealth, 0);

                ctx.lineWidth = lineWidth * 0.44;
                ctx.strokeStyle = "#f22";
                ctx.stroke();
            }

            if (entity.health > 0) {
                setGlobalAlpha(entity.health);

                ctx.beginPath();

                ctx.moveTo(0, 0);
                ctx.lineTo(HP_BAR_MAX_WIDTH * entity.health, 0);

                ctx.lineWidth = lineWidth * 0.66;
                ctx.strokeStyle = "#75dd34";
                ctx.stroke();
            }

            ctx.restore();
        }
    }
}