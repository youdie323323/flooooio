import { calculateStrokeWidth, ColorCode } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { Component, DynamicLayoutable, Interactive } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";
import ExtensionCollidable from "./extensions/ExtensionCollidable";

export default class StaticText extends ExtensionPlaceholder(Component) {
    constructor(
        private layout: DynamicLayoutable<LayoutOptions>,
        
        private textFn: DynamicLayoutable<string>,
        private fontSize: DynamicLayoutable<number>,
        private fillStyle: DynamicLayoutable<ColorCode> = () => "#ffffff",

        private readonly isLeft: boolean = false,
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

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = this.isLeft ? "left" : 'center';

        ctx.fillStyle = this.computeDynamicLayoutable(this.fillStyle);
        ctx.strokeStyle = '#000000';
        ctx.font = `${this.computeDynamicLayoutable(this.fontSize)}px Ubuntu`;
        ctx.lineWidth = calculateStrokeWidth(this.computeDynamicLayoutable(this.fontSize));

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2)

        const text = this.computeDynamicLayoutable(this.textFn);

        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
    }

    public destroy?(): void {
        this.layout = null;
        this.textFn = null;
        this.fontSize = null;
        this.fillStyle = null;
    }
}