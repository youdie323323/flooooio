import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { memo } from "../../../../../../../Shared/Utils/Memoize";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybeDynamicLayoutablePointer } from "../Component";
import { Component } from "../Component";

export const calculateStrokeWidth = memo((fontSize: number): number => {
    // 80 / 8.333333830038736 (actually this is 8+1/3 but floating point exception) = 9.59999942779541
    return fontSize / 8.333333830038736;
});

export default class Text extends ExtensionBase(Component) {
    constructor(
        private layout: MaybeDynamicLayoutablePointer<LayoutOptions>,

        private text: MaybeDynamicLayoutablePointer<string>,
        private fontSize: MaybeDynamicLayoutablePointer<number>,
        private fillStyle: MaybeDynamicLayoutablePointer<ColorCode> = "#ffffff",
        private textAlign: MaybeDynamicLayoutablePointer<CanvasTextAlign> = "center",
        private maxRenderingWidth: MaybeDynamicLayoutablePointer<number> = null,
    ) {
        super();
    }

    override calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number,
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
        return super.getCacheKey() + `${Object.values(this.computeDynamicLayoutable(this.layout)).join("")}`;
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        ctx.save();

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

        const x = this.x + this.w / 2,
            y = this.y + this.h / 2;

        if (this.maxRenderingWidth) {
            this.drawScaledText(ctx, computedText, x, y, this.computeDynamicLayoutable(this.maxRenderingWidth));
        } else {
            ctx.translate(x, y);

            ctx.strokeText(computedText, 0, 0);
            ctx.fillText(computedText, 0, 0);
        }

        ctx.restore();
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