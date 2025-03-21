import { isPetal } from "../../../../../../Shared/Entity/Dynamics/Mob/Petal/Petal";
import { MOB_PROFILES } from "../../../../../../Shared/Entity/Statics/Mob/MobProfiles";
import type { ColorCode } from "../../../../../../Shared/Utils/Color";
import { memo } from "../../../../../../Shared/Utils/Memoize";
import { uiCtx } from "../../../../../Main";
import UIGame from "../../UI/Game/UIGame";
import type Entity from "../Entity";
import Mob from "../Mob";
import Player from "../Player";
import type { RenderingContext } from "./RendererRenderingContext";

const interpolateColor = memo((sourceColor: number[], targetColor: number[], progress: number): number[] => {
    const inverseProgress = 1 - progress;

    return [
        sourceColor[0] * progress + targetColor[0] * inverseProgress,
        sourceColor[1] * progress + targetColor[1] * inverseProgress,
        sourceColor[2] * progress + targetColor[2] * inverseProgress,
    ];
});

const hexToRgb = memo((hexColor: ColorCode) => {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ];
});

const rgbArrayToString = memo((rgbArray: number[]): string => {
    return "rgb(" + rgbArray.join(",") + ")";
});

const TARGET_COLOR = [255, 0, 0];

export default class Renderer<T extends Entity> {
    /**
     * Render the entity.
     */
    public render(context: RenderingContext<T>): void {
        const { ctx, entity, entityOnlyRenderGeneralPart: generalPartOnly } = context;

        ctx.translate(entity.x, entity.y);

        if (!generalPartOnly) {
            this.drawEntityDetail(context);

            this.drawDead(context);
        }
    }

    /**
     * Determine if entity should render.
     */
    public isRenderingCandidate(context: RenderingContext<T>): boolean {
        const { entity, entityOnlyRenderGeneralPart: generalPartOnly } = context;

        return !(
            !generalPartOnly &&
            entity.isDead &&
            entity.deadT > 1
        );
    }

    /**
     * Change the color based on hit effect.
     */
    protected getSkinColor({ entity }: RenderingContext<T>, color: ColorCode): string {
        const invertedHurtT = 1 - entity.hurtT;
        if (invertedHurtT >= 1) {
            return color;
        }

        return rgbArrayToString(
            interpolateColor(
                hexToRgb(color),
                TARGET_COLOR,
                invertedHurtT * 0.25 + 0.75,
            ),
        );
    }

    /**
     * Change scale and alpha if entity is dead.
     */
    protected drawDead({ ctx, entity }: RenderingContext<T>) {
        if (entity.isDead) {
            const sinWavedDeadT = Math.sin(entity.deadT * Math.PI / 2);
            const scale = 1 + sinWavedDeadT;
            
            ctx.scale(scale, scale);
            ctx.globalAlpha *= 1 - sinWavedDeadT;
        }
    }

    protected drawEntityDetail({ ctx, entity }: RenderingContext<T>) {
        if (
            entity.hpAlpha <= 0 ||
            entity instanceof Mob && isPetal(entity.type)
        ) {
            return;
        }

        if (
            entity instanceof Player &&
            uiCtx.currentCtx instanceof UIGame &&
            // Draw nickname if not self
            entity.id !== uiCtx.currentCtx.waveSelfId
        ) {
            ctx.save();

            if (entity.isDead) ctx.globalAlpha *= 1 - Math.sin(entity.deadT * Math.PI / 2);

            ctx.translate(0, -(entity.size + 10));
            ctx.scale(0.2, 0.2);

            ctx.font = "4em Ubuntu";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.lineWidth = 8;
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = "#ffffff";

            ctx.strokeText(entity.nickname, 0, 0);
            ctx.fillText(entity.nickname, 0, 0);

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

                const { collision } = MOB_PROFILES[entity.type];

                const scale = ((collision.rx + collision.ry) * (entity.size / collision.fraction)) / 30;

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