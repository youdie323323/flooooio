import { MoodFlags } from "../../Native/Entity/Player/PlayerMood";
import { WaveRoomPlayerReadyState } from "../../../../Private/Sources/Wave/WaveRoom";
import Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererRenderingLink";
import { DARKENED_BASE } from "../../Utils/Color";
import type { MaybePointerLike } from "../Layout/Components/Component";
import { Component, OBSTRUCTION_AFFECTABLE } from "../Layout/Components/Component";
import { AbstractDynamicLayoutable } from "../Layout/Components/ComponentDynamicLayoutable";
import { calculateStrokeWidth, setGameFont } from "../Layout/Components/WellKnown/StaticText";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../Layout/Layout";
import Layout from "../Layout/Layout";
import type { WaveRoomPlayerInformation } from "./UITitle";
import UITitle from "./UITitle";

export default class UITitlePlayerProfile extends AbstractDynamicLayoutable {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    private dummyPlayer: Player = new Player(
        -1,

        // The coordinate will transform, so we can just send transform value here
        0,
        -28,

        10,
        15,
        0,
        MoodFlags.NORMAL,
        "",
    );

    constructor(
        protected readonly layoutOptions: MaybePointerLike<LayoutOptions>,

        protected readonly id: MaybePointerLike<WaveRoomPlayerInformation["id"]>,
        protected readonly name: MaybePointerLike<WaveRoomPlayerInformation["name"]>,
        protected readonly readyState: MaybePointerLike<WaveRoomPlayerInformation["readyState"]>,

        protected readonly isEmpty: MaybePointerLike<boolean>,
    ) {
        super();
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(Component.computePointerLike(this.layoutOptions), lc);
    }

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        ctx.save();

        ctx.translate(this.x, this.y);

        { // Frame
            ctx.save();

            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.globalAlpha = DARKENED_BASE;

            ctx.beginPath();
            ctx.roundRect(0, 0, this.w, this.h, 0.5);
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }

        ctx.translate(this.w / 2, this.h / 2);

        if (Component.computePointerLike(this.isEmpty)) {
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.textBaseline = 'middle';
            ctx.textAlign = "center";

            ctx.fillStyle = "white";
            setGameFont(ctx, 10);

            ctx.strokeText("Empty", 0, 0);
            ctx.fillText("Empty", 0, 0);
        } else {
            {
                const computedName = Component.computePointerLike(this.name);

                ctx.save();

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.textBaseline = 'middle';
                ctx.textAlign = "center";

                ctx.fillStyle = "white";
                setGameFont(ctx, 10);

                this.drawScaledText(ctx, computedName, 0, 0, this.w * 0.9);

                ctx.restore();
            }

            const computedId = Component.computePointerLike(this.id);

            if (
                this.context instanceof UITitle &&
                computedId === this.context.waveRoomSelfId
            ) {
                ctx.save();

                ctx.translate(0, 12);

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.textBaseline = 'middle';
                ctx.textAlign = "center";

                ctx.fillStyle = "white";
                setGameFont(ctx, 8);

                ctx.strokeText("(you)", 0, 0);
                ctx.fillText("(you)", 0, 0);

                ctx.restore();
            }

            const computedReadyState = Component.computePointerLike(this.readyState);

            if (computedReadyState === WaveRoomPlayerReadyState.READY) {
                ctx.save();

                ctx.translate(0, 32);

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.textBaseline = 'middle';
                ctx.textAlign = "center";

                ctx.fillStyle = "#70fc68";
                setGameFont(ctx, 11);

                ctx.strokeText("Ready", 0, 0);
                ctx.fillText("Ready", 0, 0);

                ctx.restore();
            }

            renderEntity({
                ctx,
                entity: this.dummyPlayer,
                isSpecimen: true,
            });
        }

        ctx.restore();
    }

    override destroy(): void {
        // To remove binded component completely, we need to access current context
        // But super.destory remove reference to context, so post-processing
        super.destroy();

        this.dummyPlayer = null;
    }

    private drawScaledText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
        const metrics = ctx.measureText(text);
        const actualWidth = metrics.width;

        ctx.save();

        if (actualWidth > maxWidth) {
            const scale = maxWidth / actualWidth;

            ctx.translate(x, y);
            ctx.scale(scale, 1);
            ctx.translate(-x, -y);

            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        } else {
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }

        ctx.restore();
    }
}
