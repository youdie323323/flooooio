import { Component, type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { CoordinatedStaticSpace, StaticPanelContainer, StaticSpace } from "../Layout/Components/WellKnown/Container";
import Mob from "../../Entity/Mob";
import { RARITY_COLOR } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import { CanvasLogo } from "../Layout/Components/WellKnown/Logo";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";

export default class UIMobIcon extends StaticPanelContainer {
    public static readonly ICON_SIZE: number = 30;

    private static readonly ICON_MOB_ANGLE: number = -3 * Math.PI / 4;

    private static readonly ICON_MOB_SIZE: number = 9;

    private static readonly ICON_MOB_LEG_DISTANCE: Array<number> = Array(Mob.STARFISH_LEG_AMOUNT).fill(150);

    /**
     * Proxy handler for mob instance that rendered to icon.
     */
    private static readonly ICON_MOB_INSTANCE_PROXY_HANDLER = {
        get(target, property, receiver) {
            // Constant size for all mob
            if (property === "size") return UIMobIcon.ICON_MOB_SIZE;

            // Constant angle for all mob
            if (property === "angle") return UIMobIcon.ICON_MOB_ANGLE;

            // No getSkinColor() interpolated color
            if (property === "hurtT") return 0;

            // No dynamic rendering
            if (property === "moveCounter") return 0;

            // No dynamic leg distance
            if (property === "legD") return UIMobIcon.ICON_MOB_LEG_DISTANCE;

            return Reflect.get(target, property, receiver);
        },
    } as const satisfies ProxyHandler<Mob>;

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        public mobInstance: Mob,
        public mobAmountAccumulator: number = 1,
    ) {
        super(
            layoutOptions,

            () => RARITY_COLOR[mobInstance.rarity],

            2,

            2.5,
            1,
        );

        // Proxy the mob instance and spoof the size/angle
        mobInstance = new Proxy(mobInstance, UIMobIcon.ICON_MOB_INSTANCE_PROXY_HANDLER);

        const { ICON_SIZE } = UIMobIcon;

        this.addChildren(
            new CoordinatedStaticSpace(ICON_SIZE, ICON_SIZE, 0, 0),
            new CanvasLogo(
                {
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                },
                (ctx: CanvasRenderingContext2D): void => {
                    // The coordinate cancel each other out
                    ctx.translate(-mobInstance.x, -mobInstance.y);

                    ctx.translate(ICON_SIZE / 2, ICON_SIZE / 2);

                    renderEntity({
                        ctx,
                        entity: mobInstance,
                        isSpecimen: true,
                    });
                },
            ),
        );
    }

    override render(ctx: CanvasRenderingContext2D): void {
        // Slightly transparent as same as florr.io
        // ctx.globalAlpha = 0.8;

        super.render(ctx);

        const computedMobCounts = Component.computePointerLike(this.mobAmountAccumulator);
        if (computedMobCounts === 1) return;

        ctx.save();

        ctx.translate(this.x + this.w - 7, this.y + 8);

        ctx.rotate((30 * Math.PI) / 180);

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = "white";
        ctx.font = "7px Ubuntu";
        ctx.strokeText("x" + computedMobCounts, 0, 0);
        ctx.fillText("x" + computedMobCounts, 0, 0);

        ctx.restore();
    }

    override destroy(): void {
        super.destroy();

        this.mobInstance = null;
    }
}