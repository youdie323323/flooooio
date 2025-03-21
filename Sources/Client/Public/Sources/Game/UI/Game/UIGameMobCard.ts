import { Component, type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { CoordinatedStaticSpace, StaticPanelContainer, StaticSpace } from "../Layout/Components/WellKnown/Container";
import type Mob from "../../Entity/Mob";
import { RARITY_COLOR } from "../../../../../../Shared/Entity/Statics/EntityRarity";
import { CanvasLogo } from "../Layout/Components/WellKnown/Logo";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";

export default class UIGameMobCard extends StaticPanelContainer {
    public static readonly CARD_SIZE: number = 30;

    private static readonly CARD_MOB_ANGLE: number = -3 * Math.PI / 4;
    private static readonly CARD_MOB_SIZE: number = 9;

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
        mobInstance = new Proxy(mobInstance, {
            get(target, property, receiver) {
                if (property === "size") return UIGameMobCard.CARD_MOB_SIZE;

                if (property === "angle") return UIGameMobCard.CARD_MOB_ANGLE;

                return Reflect.get(target, property, receiver);
            },
        });

        const { CARD_SIZE } = UIGameMobCard;

        this.addChildren(
            new CoordinatedStaticSpace(CARD_SIZE, CARD_SIZE, 0, 0),
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

                    ctx.translate(CARD_SIZE / 2, CARD_SIZE / 2);

                    renderEntity({
                        ctx,
                        entity: mobInstance,
                        entityOnlyRenderGeneralPart: true,
                    });
                },
            ),
        );
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

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