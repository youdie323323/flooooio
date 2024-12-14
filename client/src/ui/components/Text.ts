import { memo } from "../../../../shared/utils/memoize";
import { ColorCode } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { Component, MaybeDynamicLayoutablePointer, Interactive } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

export const calculateStrokeWidth = memo((fontSize: number): number => {
    // 80 / 8.333333830038736 (actually this is 8+1/3 but floating point exception) = 9.59999942779541
    return fontSize / 8.333333830038736;
});

export default class StaticText extends ExtensionPlaceholder(Component) {
    constructor(
        private layout: MaybeDynamicLayoutablePointer<LayoutOptions>,

        private text: MaybeDynamicLayoutablePointer<string>,
        private fontSize: MaybeDynamicLayoutablePointer<number>,
        private fillStyle: MaybeDynamicLayoutablePointer<ColorCode> = "#ffffff",
        private textAlign: MaybeDynamicLayoutablePointer<CanvasTextAlign> = "center",
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

        const computedFillStyle = this.computeDynamicLayoutable(this.fillStyle);
        const computedFontSize = this.computeDynamicLayoutable(this.fontSize);
        const computedText = this.computeDynamicLayoutable(this.text);
        const computedTextAlign = this.computeDynamicLayoutable(this.textAlign);

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = computedTextAlign;

        ctx.fillStyle = computedFillStyle;
        ctx.strokeStyle = '#000000';
        ctx.font = `${computedFontSize}px Ubuntu`;
        ctx.lineWidth = calculateStrokeWidth(computedFontSize);

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

        ctx.strokeText(computedText, 0, 0);
        ctx.fillText(computedText, 0, 0);
    }
}