import UIGame from "../../UI/Game/UIGame";
import type Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import type { RenderingContext } from "./RendererRenderingContext";
import MOB_PROFILES from "../../../../../Shared/Native/mob_profiles.json";
import { uiCtx } from "../../../../Application";
import type { MobData } from "../../../../Private/Sources/Entity/Mob/MobData";
import type { ColorCode } from "../../Utils/Color";
import { memo } from "../../Utils/Memoize";
import { isPetal } from "../Petal";
import { MobType, PetalType } from "../../Native/Entity/EntityType";
import { setGameFont } from "../../UI/Layout/Components/WellKnown/StaticText";

const hexToRgb = memo((hexColor: ColorCode) => {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ];
});

const TARGET_COLOR = [255, 0, 0] as const;

export default class Renderer<T extends Entity> {
    private static readonly HP_BAR_MAX_WIDTH = 45 as const;

    /**
     * Render the entity.
     */
    public render(context: RenderingContext<T>): void {
        const { ctx, entity: { x, y, angle }, isSpecimen } = context;

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
     * Change the color based on hit.
     */
    protected calculateDamageEffectColor({ entity: { hurtT } }: RenderingContext<T>, color: ColorCode): string {
        const invertedHurtT = 1 - hurtT;
        if (invertedHurtT >= 1) return color;

        const progress = invertedHurtT * 0.5 + 0.5;

        const sourceRgb = hexToRgb(color);

        const r = Math.round(sourceRgb[0] * progress + TARGET_COLOR[0] * (1 - progress));
        const g = Math.round(sourceRgb[1] * progress + TARGET_COLOR[1] * (1 - progress));
        const b = Math.round(sourceRgb[2] * progress + TARGET_COLOR[2] * (1 - progress));

        return `rgb(${r},${g},${b})`;
    }

    /**
     * Change scale and alpha if entity is dead.
     */
    protected applyDeathAnimation({ ctx, entity: { isDead, deadT } }: RenderingContext<T>) {
        if (isDead) {
            const sinWavedDeadT = Math.sin(deadT * Math.PI / 3);

            const scale = 1 + sinWavedDeadT;

            ctx.scale(scale, scale);
            ctx.globalAlpha *= 1 - sinWavedDeadT;
        }
    }

    protected drawEntityStatus({ ctx, entity }: RenderingContext<T>) {
        if (entity instanceof Mob && (
            isPetal(entity.type) ||
            entity.type === MobType.MISSILE
            // This condition is unrechable because leech body is always full hp and hp bar is not rendered
            // (entity.type === MobType.LEECH && entity.connectingSegment)
        )) return;

        if (entity.hpAlpha <= 0) return;

        if (
            entity instanceof Player &&
            uiCtx.currentCtx instanceof UIGame &&
            // Draw nickname if not self
            entity.id !== uiCtx.currentCtx.waveSelfId
        ) {
            ctx.save();

            ctx.translate(0, -(entity.size + 10));
            ctx.scale(0.2, 0.2);

            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            ctx.fillStyle = "#ffffff";
            setGameFont(ctx, 8);

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

                const scale = ((radius * 2) * (entity.size / fraction)) / 30;

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