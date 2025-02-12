import { MoodFlags } from "../../../../../Shared/mood";
import { WaveRoomPlayerReadyState } from "../../../../../Shared/WaveRoom";
import Player from "../../../Entity/Player";
import { renderEntity } from "../../../Entity/Renderers/RendererEntityRenderingLink";
import { DARKEND_BASE } from "../../../Utils/common";
import { waveRoomSelfId } from "../../../Utils/Networking";
import Layout, { LayoutOptions, LayoutResult } from "../../Layout/Layout";
import { WaveRoomPlayerInformation } from "../../Mode/UserInterfaceModeTitle";
import { Component, MaybeDynamicLayoutablePointer } from "../Component";
import ExtensionBase from "../Extensions/Extension";
import { calculateStrokeWidth } from "../WellKnown/Text";

export default class PlayerProfile extends ExtensionBase(Component) {
    private dummyPlayerEntity: Player = new Player(
        true,

        -1,

        // The coordinate will transform, so we can send transform value here
        0,
        -28,

        10,
        15,
        0,
        MoodFlags.Normal,
        "",
    );

    constructor(
        private layout: MaybeDynamicLayoutablePointer<LayoutOptions>,

        private id: MaybeDynamicLayoutablePointer<WaveRoomPlayerInformation["id"]>,
        private name: MaybeDynamicLayoutablePointer<WaveRoomPlayerInformation["name"]>,
        private readyState: MaybeDynamicLayoutablePointer<WaveRoomPlayerInformation["readyState"]>,

        private isEmpty: MaybeDynamicLayoutablePointer<boolean>,
    ) {
        super();
    }

    override calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        return Layout.layout(
            this.computeDynamicLayoutable(this.layout),
            width,
            height,
            originX,
            originY,
        );
    }

    override getCacheKey(): string {
        return super.getCacheKey() + `${Object.values(this.computeDynamicLayoutable(this.layout)).join("")}`
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

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
            {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.textBaseline = 'middle';
                ctx.textAlign = "center";

                ctx.fillStyle = "white";
                ctx.strokeStyle = '#000000';
                ctx.font = `${10}px Ubuntu`;
                ctx.lineWidth = calculateStrokeWidth(10);

                const computedName = this.computeDynamicLayoutable(this.name);

                ctx.strokeText(computedName, 0, 0);
                ctx.fillText(computedName, 0, 0);
            }

            const computedId = this.computeDynamicLayoutable(this.id);

            if (computedId === waveRoomSelfId) {
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
    }

    override destroy(): void {
        super.destroy();

        this.dummyPlayerEntity = null;
    }
}
