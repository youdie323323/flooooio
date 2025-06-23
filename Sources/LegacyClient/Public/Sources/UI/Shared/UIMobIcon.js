"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = require("../Layout/Components/WellKnown/Container");
const Mob_1 = require("../../Entity/Mob");
const Rarity_1 = require("../../Native/Rarity");
const RendererRenderingLink_1 = require("../../Entity/Renderers/RendererRenderingLink");
const StaticText_1 = require("../Layout/Components/WellKnown/StaticText");
class UIMobIcon extends Container_1.StaticPanelContainer {
    static { this.ICON_MOB_ANGLE = -3 * Math.PI / 4; }
    static { this.ICON_MOB_SIZE = 9; }
    static { this.ICON_MOB_LEG_DISTANCE = (0, Mob_1.generateDefaultStarfishLegDistance)(); }
    /**
     * Proxy handler for mob instance that rendered to icon.
     */
    static { this.ICON_MOB_INSTANCE_PROXY_HANDLER = {
        get(target, property, receiver) {
            if (property === "size")
                return UIMobIcon.ICON_MOB_SIZE;
            // Constant angle for all mob
            if (property === "angle")
                return UIMobIcon.ICON_MOB_ANGLE;
            // No getSkinColor() interpolated color
            if (property === "hurtT")
                return 0;
            // No dynamic moving rendering
            if (property === "moveCounter")
                return 0;
            // No sandstorm angle move
            if (property === "sandstormAngle")
                return 0;
            // No dynamic leg distance
            if (property === "legD")
                return UIMobIcon.ICON_MOB_LEG_DISTANCE;
            // Important: override beakAngle directly to remove redudant cos calculation
            if (property === "beakAngle")
                return 0;
            return Reflect.get(target, property, receiver);
        },
        // Disable write
        set: function () {
            return false;
        },
    }; }
    constructor(layoutOptions, mob, amount = 1) {
        const { ICON_MOB_INSTANCE_PROXY_HANDLER } = UIMobIcon;
        super(layoutOptions, false, () => Rarity_1.RARITY_COLOR[mob.rarity], 2, 2.5, 1);
        this.mob = mob;
        this.amount = amount;
        // Proxy the mob instance and spoof the size/angle
        this.mob = new Proxy(this.mob, ICON_MOB_INSTANCE_PROXY_HANDLER);
    }
    render(ctx) {
        super.render(ctx);
        const { mob, amount } = this;
        const cw = this.w / 2, ch = this.h / 2;
        ctx.translate(this.x + cw, this.y + ch);
        { // Draw mob
            ctx.save();
            // The coordinate cancel each other out
            ctx.translate(-mob.x, -mob.y);
            (0, RendererRenderingLink_1.renderEntity)({
                ctx,
                entity: mob,
                isSpecimen: true,
            });
            ctx.restore();
        }
        if (amount === 1)
            return;
        ctx.translate(cw - 8, -ch + 7);
        ctx.rotate((20 * Math.PI) / 180);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        (0, StaticText_1.setGameFont)(ctx, 8);
        const amountString = "x" + amount;
        ctx.strokeText(amountString, 0, 0);
        ctx.fillText(amountString, 0, 0);
    }
    destroy() {
        super.destroy();
        this.mob = null;
    }
}
exports.default = UIMobIcon;
