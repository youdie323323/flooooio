import { calculateStrokeWidth, ColorCode } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { Component, DynamicLayoutable, Interactive } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

export default class StaticText extends ExtensionPlaceholder(Component) {
    constructor(
        private layout: DynamicLayoutable<LayoutOptions>,

        private text: DynamicLayoutable<string>,
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

    public override getCacheKey(): string {
        return super.getCacheKey() + `${this.computeDynamicLayoutable(this.text)}${this.computeDynamicLayoutable(this.fontSize)}${this.computeDynamicLayoutable(this.fillStyle)}`
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = this.isLeft ? "left" : 'center';

        const computedFillStyle = this.computeDynamicLayoutable(this.fillStyle);
        const computedFontSize = this.computeDynamicLayoutable(this.fontSize);
        const computedText = this.computeDynamicLayoutable(this.text);

        ctx.fillStyle = computedFillStyle;
        ctx.strokeStyle = '#000000';
        ctx.font = `${computedFontSize}px Ubuntu`;
        ctx.lineWidth = calculateStrokeWidth(computedFontSize);

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

        ctx.strokeText(computedText, 0, 0);
        ctx.fillText(computedText, 0, 0);
    }

    public destroy?(): void {
        this.layout = null;
        this.text = null;
        this.fontSize = null;
        this.fillStyle = null;
    }
}