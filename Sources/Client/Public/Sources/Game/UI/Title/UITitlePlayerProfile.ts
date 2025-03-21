import { MoodFlags } from "../../../../../../Shared/Mood";
import { DARKEND_BASE } from "../../../../../../Shared/Utils/Color";
import { WaveRoomPlayerReadyState } from "../../../../../../Shared/WaveRoom";
import Player from "../../Entity/Player";
import { renderEntity } from "../../Entity/Renderers/RendererEntityRenderingLink";
import type { MaybePointerLike } from "../Layout/Components/Component";
import { Component } from "../Layout/Components/Component";
import { AbstractDynamicLayoutable } from "../Layout/Components/ComponentDynamicLayoutable";
import Text, { calculateStrokeWidth } from "../Layout/Components/WellKnown/Text";
import { InlineRenderingCall } from "../Layout/Extensions/ExtensionInlineRenderingCall";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../Layout/Layout";
import Layout from "../Layout/Layout";
import type { WaveRoomPlayerInformation } from "./UITitle";
import UITitle from "./UITitle";

export default class UITitlePlayerProfile extends AbstractDynamicLayoutable {
    private dummyPlayerEntity: Player = new Player(
        true,

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

    private nameText: Text;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<LayoutOptions>,

        protected readonly id: MaybePointerLike<WaveRoomPlayerInformation["id"]>,
        protected readonly name: MaybePointerLike<WaveRoomPlayerInformation["name"]>,
        protected readonly readyState: MaybePointerLike<WaveRoomPlayerInformation["readyState"]>,

        protected readonly isEmpty: MaybePointerLike<boolean>,
    ) {
        super();

        this.once("onInitialized", () => {
            this.context.addComponent(
                this.nameText = new (InlineRenderingCall(Text))(
                    {
                        x: 0,
                        y: 0,
                    },
                    this.name,
                    10,
                    "#ffffff",
                    "center",
                    () => this.w * 0.9,
                ),
            );
        });
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(Component.computePointerLike(this.layoutOptions), lc);
    }

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return super.getCacheKey(lc) + CACHE_KEY_DELIMITER +
            Object.values(Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update(ctx);

        ctx.save();

        ctx.translate(this.x, this.y);

        // Frame
        {
            ctx.save();

            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.globalAlpha = DARKEND_BASE;

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
            ctx.strokeStyle = '#000000';
            ctx.font = `${10}px Ubuntu`;
            ctx.lineWidth = calculateStrokeWidth(10);

            ctx.strokeText("Empty", 0, 0);
            ctx.fillText("Empty", 0, 0);
        } else {
            ctx.save();

            this.nameText.render(ctx);

            ctx.restore();

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
                ctx.strokeStyle = '#000000';
                ctx.font = `${8}px Ubuntu`;
                ctx.lineWidth = calculateStrokeWidth(8);

                ctx.strokeText("(you)", 0, 0);
                ctx.fillText("(you)", 0, 0);

                ctx.restore();
            }

            const computedReadyState = Component.computePointerLike(this.readyState);

            if (computedReadyState === WaveRoomPlayerReadyState.Ready) {
                ctx.save();

                ctx.translate(0, 32);

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.textBaseline = 'middle';
                ctx.textAlign = "center";

                ctx.fillStyle = "#70fc68";
                ctx.strokeStyle = '#000000';
                ctx.font = `${11}px Ubuntu`;
                ctx.lineWidth = calculateStrokeWidth(11);

                ctx.strokeText("Ready", 0, 0);
                ctx.fillText("Ready", 0, 0);

                ctx.restore();
            }

            renderEntity(ctx, this.dummyPlayerEntity);
        }

        ctx.restore();
    }

    override destroy(): void {
        // Remove binded name text component
        this.nameText.destroy();

        // To remove binded component completely, we need to access current context
        // But super.destory remove reference to context, so post-processing
        super.destroy();

        this.dummyPlayerEntity = null;
    }
}