import { MoodFlags } from "../../../../../../../Shared/Mood";
import { DARKEND_BASE } from "../../../../../../../Shared/Utils/Color";
import { WaveRoomPlayerReadyState } from "../../../../../../../Shared/WaveRoom";
import Player from "../../../../Entity/Player";
import { renderEntity } from "../../../../Entity/Renderers/RendererEntityRenderingLink";
import type { WaveRoomPlayerInformation } from "../../../Title/UITitle";
import UITitle from "../../../Title/UITitle";
import ExtensionBase from "../../Extensions/Extension";
import { InlineRenderingCall } from "../../Extensions/ExtensionInlineRenderingCall";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { DynamicLayoutablePointer } from "../Component";
import { Component } from "../Component";
import Text, { calculateStrokeWidth } from "../WellKnown/Text";

// TODO: implement these native components in each UI scene folder

export default class PlayerProfile extends ExtensionBase(Component) {
    private dummyPlayerEntity: Player = new Player(
        true,

        -1,

        // The coordinate will transform, so we can just send transform value here
        0,
        -28,

        10,
        15,
        0,
        MoodFlags.Normal,
        "",
    );

    private nameText: Text;

    constructor(
        private layout: DynamicLayoutablePointer<LayoutOptions>,

        private id: DynamicLayoutablePointer<WaveRoomPlayerInformation["id"]>,
        private name: DynamicLayoutablePointer<WaveRoomPlayerInformation["name"]>,
        private readyState: DynamicLayoutablePointer<WaveRoomPlayerInformation["readyState"]>,

        private isEmpty: DynamicLayoutablePointer<boolean>,
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

    override calculateLayout(lc: LayoutContext): LayoutResult {
        return Layout.layout(this.computeDynamicLayoutable(this.layout), lc);
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(this.computeDynamicLayoutable(this.layout)).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

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

        if (this.computeDynamicLayoutable(this.isEmpty)) {
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

            const computedId = this.computeDynamicLayoutable(this.id);

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

            const computedReadyState = this.computeDynamicLayoutable(this.readyState);

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
        super.destroy();

        this.nameText.destroy();

        this.dummyPlayerEntity = null;
    }
}
