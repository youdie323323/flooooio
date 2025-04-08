import { Component, type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { CoordinatedStaticSpace, StaticPanelContainer } from "../Layout/Components/WellKnown/Container";
import type Mob from "../../Entity/Mob";
import { generateDefaultStarfishLegDistance } from "../../Entity/Mob";
import { RARITY_COLOR } from "../../Native/Rarity";
import { CanvasLogo } from "../Layout/Components/WellKnown/Logo";
import { renderEntity } from "../../Entity/Renderers/RendererRenderingLink";
import type { LayoutOptions } from "../Layout/Layout";

export default class UIMobIcon extends StaticPanelContainer {
    private static readonly ICON_MOB_ANGLE: number = -3 * Math.PI / 4;

    private static readonly ICON_MOB_SIZE: number = 9;

    private static readonly ICON_MOB_LEG_DISTANCE: Array<number> = generateDefaultStarfishLegDistance();

    /**
     * Proxy handler for mob instance that rendered to icon.
     */
    private static readonly ICON_MOB_INSTANCE_PROXY_HANDLER = {
        get(target, property, receiver) {
            if (property === "size") return UIMobIcon.ICON_MOB_SIZE;

            // Constant angle for all mob
            if (property === "angle") return UIMobIcon.ICON_MOB_ANGLE;

            // No getSkinColor() interpolated color
            if (property === "hurtT") return 0;

            // No dynamic rendering
            if (property === "moveCounter") return 0;

            // No sandstorm angle move
            if (property === "sandstormAngle") return 0;

            // No dynamic leg distance
            if (property === "legD") return UIMobIcon.ICON_MOB_LEG_DISTANCE;

            return Reflect.get(target, property, receiver);
        },
        // Disable write
        set: function () {
            return false;
        },
    } as const satisfies ProxyHandler<Mob>;

    constructor(
        layoutOptions: MaybePointerLike<LayoutOptions>,

        public mob: Mob,

        public amount: number = 1,
    ) {
        const { ICON_MOB_INSTANCE_PROXY_HANDLER } = UIMobIcon;

        super(
            layoutOptions,

            false,

            () => RARITY_COLOR[mob.rarity],

            2,

            2.5,
            1,
        );

        // Proxy the mob instance and spoof the size/angle
        this.mob = new Proxy(this.mob, ICON_MOB_INSTANCE_PROXY_HANDLER);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const { mob, amount } = this;

        const cw = this.w / 2,
            ch = this.h / 2;

        ctx.translate(this.x + cw, this.y + ch);

        { // Draw mob
            ctx.save();

            // The coordinate cancel each other out
            ctx.translate(-mob.x, -mob.y);

            renderEntity({
                ctx,
                entity: mob,
                isSpecimen: true,
            });

            ctx.restore();
        }

        if (amount === 1) return;

        ctx.translate(cw - 7, -ch + 8);

        ctx.rotate((30 * Math.PI) / 180);

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = "white";
        ctx.font = "7px Ubuntu";
        ctx.strokeText("x" + amount, 0, 0);
        ctx.fillText("x" + amount, 0, 0);
    }

    override destroy(): void {
        super.destroy();

        this.mob = null;
    }
}