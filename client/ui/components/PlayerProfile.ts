import { Mood } from "../../../shared/enum";
import EntityPlayer from "../../entity/EntityPlayer";
import { waveRoomSelfId } from "../../Networking";
import { calculateStrokeWidth, ColorCode, darkend, DARKEND_BASE } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { WaveRoomPlayerInformation } from "../mode/UserInterfaceModeTitle";
import { uiScaleFactor } from "../UserInterface";
import { Component, ComponentContainer, DynamicLayoutable } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

export default class PlayerProfile extends ExtensionPlaceholder(Component) {
    private entityPlayer: EntityPlayer = new EntityPlayer(
        -1,

        // The coordinate will transform, so we can just send transform value hre
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
        private layout: DynamicLayoutable<LayoutOptions>,
        private id: DynamicLayoutable<WaveRoomPlayerInformation["id"]>,
        private name: DynamicLayoutable<WaveRoomPlayerInformation["name"]>,
        private isEmpty: DynamicLayoutable<boolean>,
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

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        ctx.save();

        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";
        ctx.globalAlpha = 0.2;

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 1);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

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

            ctx.restore();

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

            this.entityPlayer.draw(ctx);
        }
    }

    public destroy?(): void {

    }
}
