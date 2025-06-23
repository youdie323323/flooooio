"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UIGame_1 = __importDefault(require("../../UI/Game/UIGame"));
const Mob_1 = __importDefault(require("../Mob"));
const Player_1 = __importDefault(require("../Player"));
const mob_profiles_json_1 = __importDefault(require("../../../../../Shared/Florr/Native/ProfileData/mob_profiles.json"));
const Application_1 = require("../../../../Application");
const Memoize_1 = require("../../Utils/Memoize");
const Petal_1 = require("../Petal");
const StaticText_1 = require("../../UI/Layout/Components/WellKnown/StaticText");
const hexToRgb = (0, Memoize_1.memo)((hexColor) => {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ];
});
function blendColor([sr, sg, sb], [tr, tg, tb], t) {
    const tInvert = 1 - t;
    return [
        (sr * t) + (tr * tInvert),
        (sg * t) + (tg * tInvert),
        (sb * t) + (tb * tInvert),
    ];
}
function blendColors(colors, t) {
    const last = colors.length - 1;
    const segment = t * last;
    const index = Math.floor(segment);
    if (index >= last)
        return colors[last];
    return blendColor(colors[index], colors[index + 1], 1 - (segment - index));
}
const HURT_TARGET_COLOR_MIDDLE = [255, 0, 0];
const HURT_TARGET_COLOR_LAST = [255, 255, 255];
const POISON_TARGET_COLOR = [189, 80, 255];
class Renderer {
    static { this.HP_BAR_MAX_WIDTH = 45; }
    /**
     * Render the entity.
     */
    render(context) {
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
    isRenderingCandidate({ entity, isSpecimen }) {
        return !(!isSpecimen &&
            entity.isDead &&
            entity.deadT > 1);
    }
    /**
     * Context guard that protected rendering from clip.
     */
    guard(ctx) {
        ctx.save();
        return { [Symbol.dispose]: () => { ctx.restore(); } };
    }
    /**
     * Change the color based on effects.
     */
    toEffectedColor({ entity: { hurtT, poisonT } }, color) {
        // No effects to apply
        if (hurtT === 0 && poisonT === 0)
            return color;
        let sourceRgb = hexToRgb(color);
        // Apply additional colors
        if (poisonT > 0)
            sourceRgb = blendColor(sourceRgb, POISON_TARGET_COLOR, 0.75 * (1 - poisonT));
        const blended = blendColors([sourceRgb, HURT_TARGET_COLOR_MIDDLE, HURT_TARGET_COLOR_LAST], 0.95 * (1 - hurtT));
        const [r, g, b] = blendColor(sourceRgb, blended, 0.5);
        return `rgb(${r},${g},${b})`;
    }
    /**
     * Change scale and alpha if entity is dead.
     */
    applyDeathAnimation({ ctx, entity }) {
        const { isDead, deadT } = entity;
        if (isDead) {
            const isLeech = entity instanceof Mob_1.default && entity.type === 14 /* MobType.LEECH */;
            const sinWavedDeadT = Math.sin(deadT * Math.PI / (isLeech
                ? 9
                : 3));
            const scale = 1 + sinWavedDeadT;
            ctx.scale(scale, scale);
            ctx.globalAlpha *= 1 - (isLeech ? 2 : 1) * sinWavedDeadT;
        }
    }
    drawEntityStatus({ ctx, entity }) {
        if (entity instanceof Mob_1.default && ((0, Petal_1.isPetal)(entity.type) || entity.type === 18 /* MobType.MISSILE_PROJECTILE */))
            return;
        if (entity.hpAlpha <= 0)
            return;
        if (entity instanceof Player_1.default &&
            Application_1.uiCtx.currentContext instanceof UIGame_1.default &&
            // Draw nickname if not self
            entity.id !== Application_1.uiCtx.currentContext.waveSelfId) {
            ctx.save();
            ctx.translate(0, -entity.size - 10);
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFFFFF";
            (0, StaticText_1.setGameFont)(ctx, 12);
            ctx.strokeText(entity.name, 0, 0);
            ctx.fillText(entity.name, 0, 0);
            ctx.restore();
        }
        const { HP_BAR_MAX_WIDTH } = Renderer;
        // Draw hp bar if health decreasing and living
        if (!entity.isDead &&
            1 > entity.health) {
            ctx.save();
            let lineWidth;
            if (entity instanceof Player_1.default) {
                lineWidth = 5;
                ctx.translate(0, entity.size);
                ctx.translate(-HP_BAR_MAX_WIDTH / 2, 9 / 2 + 5);
            }
            else if (entity instanceof Mob_1.default) {
                lineWidth = 6.5;
                const { collision: { radius, fraction } } = mob_profiles_json_1.default[entity.type];
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
            function setGlobalAlpha(hp) {
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
exports.default = Renderer;
