import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import type { MobData } from "../../../../../../Shared/Entity/Statics/Mob/MobData";
import type { ColorCode } from "../../../../../../Shared/Utils/Color";
import { memo } from "../../../../../../Shared/Utils/Memoize";
import { uiCtx } from "../../../../../Main";
import UIGame from "../../UI/Game/UIGame";
import type Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import type { RenderingContext } from "./RendererRenderingContext";
import MOB_PROFILES from "../../../../../../Shared/Native/mob_profiles.json";

const hexToRgb = memo((hexColor: ColorCode) => {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ];
});

const TARGET_COLOR = [255, 0, 0];

export default class Renderer<T extends Entity> {
    /**
     * Render the entity.
     */
    public render(context: RenderingContext<T>): void {
        const { ctx, entity: { x, y }, entity, isSpecimen } = context;

        ctx.translate(x, y);

        if (!isSpecimen) {
            this.applyDeathAnimation(context);

            if (!(entity instanceof Mob && isPetal(entity.type))) this.drawEntityStatus(context);
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
    protected calculateDamageEffectColor({ entity }: RenderingContext<T>, color: ColorCode): string {
        const invertedHurtT = 1 - entity.hurtT;
        if (invertedHurtT >= 1) return color;

        const progress = invertedHurtT * 0.25 + 0.75;

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
            const sinWavedDeadT = Math.sin(deadT * Math.PI / 2);

            const scale = 1 + sinWavedDeadT;

            ctx.scale(scale, scale);
            ctx.globalAlpha *= 1 - sinWavedDeadT;
        }
    }

    protected drawEntityStatus({ ctx, entity }: RenderingContext<T>) {
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

            ctx.font = "4em Ubuntu";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.lineWidth = 8;
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = "#ffffff";

            ctx.strokeText(entity.name, 0, 0);
            ctx.fillText(entity.name, 0, 0);

            ctx.restore();
        }

        const HP_BAR_MAX_WIDTH: number = 45;

        // Draw hp bar if health decreasing and living
        if (
            !entity.isDead &&
            1 > entity.health
        ) {
            ctx.save();

            ctx.globalAlpha = entity.hpAlpha;
            ctx.strokeStyle = "#222";
            ctx.beginPath();

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

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(HP_BAR_MAX_WIDTH, 0);
            ctx.lineCap = "round";
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = "#222";
            ctx.stroke();

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