import type { ColorCode } from "../../../../../../../../Shared/Utils/Color";
import { memo } from "../../../../../../../../Shared/Utils/Memoize";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component } from "../Component";
import type { AutomaticallySizedLayoutOptions } from "./Container";

export const calculateStrokeWidth = memo((fontSize: number): number => {
    // 80 / 8.333333830038736 (actually this is 8+1/3 but floating point exception) = 9.59999942779541
    return fontSize / 8.333333830038736;
});

export default class Text extends ExtensionBase(Component) {
    private static readonly TEXT_WIDTH_OFFSET: number = 10;
    private static readonly TEXT_HEIGHT_COEF: number = 1.25;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        protected readonly text: MaybePointerLike<string>,
        protected readonly fontSize: MaybePointerLike<number>,
        protected readonly fillStyle: MaybePointerLike<ColorCode> = "#ffffff",
        protected readonly textAlign: MaybePointerLike<CanvasTextAlign> = "center",
        protected readonly textLimitWidth: MaybePointerLike<number> = null,
    ) {
        super();
    }

    private calculateSize(ctx: CanvasRenderingContext2D): [number, number] {
        const computedFontSize = Component.computePointerLike(this.fontSize);
        const computedText = Component.computePointerLike(this.text);

        ctx.save();

        ctx.font = `${computedFontSize}px Ubuntu`;
        const metrics = ctx.measureText(computedText);

        ctx.restore();

        return [
            metrics.width + Text.TEXT_WIDTH_OFFSET,
            (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * Text.TEXT_HEIGHT_COEF,
        ];
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx } = lc;

        const [w, h] = this.calculateSize(ctx);

        return Layout.layout(
            {
                ...Component.computePointerLike(this.layoutOptions),

                w,
                h,
            },
            lc,
        );
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(Component.computePointerLike(this.layoutOptions)).join("");
        // Component.computeDynamicLayoutable(this.text) +
        // Component.computeDynamicLayoutable(this.fontSize) + 
        // Component.computeDynamicLayoutable(this.fillStyle) + 
        // Component.computeDynamicLayoutable(this.textAlign) + 
        // Component.computeDynamicLayoutable(this.textWidthLimit);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update(ctx);

        ctx.save();

        const computedFillStyle = Component.computePointerLike(this.fillStyle);
        const computedFontSize = Component.computePointerLike(this.fontSize);
        const computedText = Component.computePointerLike(this.text);
        const computedTextAlign = Component.computePointerLike(this.textAlign);

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

        if (this.textLimitWidth) {
            const computedTextWidthLimit = Component.computePointerLike(this.textLimitWidth);

            this.drawScaledText(ctx, computedText, x, y, computedTextWidthLimit);
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