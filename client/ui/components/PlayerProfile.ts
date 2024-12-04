import { Mood } from "../../../shared/enum";
import { WaveRoomPlayerReadyState } from "../../../shared/waveRoom";
import EntityPlayer from "../../entity/EntityPlayer";
import { waveRoomSelfId } from "../../Networking";
import { ColorCode, darkend, DARKEND_BASE } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { WaveRoomPlayerInformation } from "../mode/UserInterfaceModeTitle";
import { uiScaleFactor } from "../UserInterface";
import { Component, ComponentContainer, MaybeDynamicLayoutablePointer } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";
import { calculateStrokeWidth } from "./Text";

export default class PlayerProfile extends ExtensionPlaceholder(Component) {
    private entityPlayer: EntityPlayer = new EntityPlayer(
        -1,

        // The coordinate will transform, so we can just send transform value here
        0,
        -28,

        10,
        15,
        0,
        0,
        Mood.NORMAL,
        "",
        true,
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

    public calculateLayout(
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

    public override getCacheKey(): string {
        return super.getCacheKey() + `${Object.values(this.computeDynamicLayoutable(this.layout)).join("")}`
    }

    public invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    public render(ctx: CanvasRenderingContext2D): void {
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

            if (computedReadyState === WaveRoomPlayerReadyState.READY) {
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

            this.entityPlayer.draw(ctx);
        }
    }

    public destroy(): void {
        super.destroy();

        this.layout = null;

        this.id = null;
        this.name = null;
        this.readyState = null;

        this.isEmpty = null;

        this.entityPlayer = null;
    }
}
