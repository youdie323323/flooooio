import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { memo } from "../../../../../../../Shared/Utils/Memoize";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { DynamicLayoutablePointer } from "../Component";
import { Component } from "../Component";
import type { AutomaticallySizableLayoutOptions } from "./Container";

export const calculateStrokeWidth = memo((fontSize: number): number => {
    // 80 / 8.333333830038736 (actually this is 8+1/3 but floating point exception) = 9.59999942779541
    return fontSize / 8.333333830038736;
});

export default class Text extends ExtensionBase(Component) {
    constructor(
        private layout: DynamicLayoutablePointer<AutomaticallySizableLayoutOptions>,

        private text: DynamicLayoutablePointer<string>,
        private fontSize: DynamicLayoutablePointer<number>,
        private fillStyle: DynamicLayoutablePointer<ColorCode> = "#ffffff",
        private textAlign: DynamicLayoutablePointer<CanvasTextAlign> = "center",
        private textWidthLimit: DynamicLayoutablePointer<number> = null,
    ) {
        super();
    }

    private calculateSize(ctx: CanvasRenderingContext2D): [number, number] {
        const computedFontSize = this.computeDynamicLayoutable(this.fontSize);
        const computedText = this.computeDynamicLayoutable(this.text);

        ctx.save();

        ctx.font = `${computedFontSize}px Ubuntu`;
        const metrics = ctx.measureText(computedText);

        ctx.restore();

        return [
            metrics.width,
            (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 1.1,
        ];
    }

    override calculateLayout(lc: LayoutContext): LayoutResult {
        const { ctx } = lc;

        const [w, h] = this.calculateSize(ctx);

        return Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),

                w,
                h,
            },
            lc,
        );
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(this.computeDynamicLayoutable(this.layout)).join("");
        // this.computeDynamicLayoutable(this.text) +
        // this.computeDynamicLayoutable(this.fontSize) + 
        // this.computeDynamicLayoutable(this.fillStyle) + 
        // this.computeDynamicLayoutable(this.textAlign) + 
        // this.computeDynamicLayoutable(this.textWidthLimit);
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

        if (this.textWidthLimit) {
            this.drawScaledText(ctx, computedText, x, y, this.computeDynamicLayoutable(this.textWidthLimit));
        } else {
            ctx.strokeText(computedText, x, y);
            ctx.fillText(computedText, x, y);
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