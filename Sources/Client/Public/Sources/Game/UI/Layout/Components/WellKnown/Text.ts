import type { ColorCode } from "../../../../../../../../Shared/Utils/Color";
import { memo } from "../../../../../../../../Shared/Utils/Memoize";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component, OBSTRUCTION_AFFECTABLE } from "../Component";
import type { AutomaticallySizedLayoutOptions, SizeKeys } from "./Container";

export const calculateStrokeWidth = memo((fontSize: number): number => {
    // 80 / 8.333333830038736 (actually this is 8+1/3 but floating point exception) = 9.59999942779541
    return fontSize / 8.333333830038736;
});

export default class Text extends ExtensionBase(Component<Readonly<{
    "onCopySucceed": [];
    "onCopyFailed": [];
}>>) {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    private static readonly TEXT_WIDTH_OFFSET: number = 10;
    private static readonly TEXT_HEIGHT_COEF: number = 1.25;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        protected readonly text: MaybePointerLike<string>,
        protected readonly fontSize: MaybePointerLike<number>,
        protected readonly fillStyle: MaybePointerLike<ColorCode> = "#ffffff",
        protected readonly textAlign: MaybePointerLike<CanvasTextAlign> = "center",
        protected readonly textLimitWidth: MaybePointerLike<number> = null,

        isCopyable: MaybePointerLike<boolean> = false,
        copySource?: MaybePointerLike<string>,
    ) {
        super();

        if (isCopyable && !copySource) {
            throw new Error("Text: text is copyable, but source string is not computable");
        }

        // Only enable OBSTRUCTION_AFFECTABLE symbol when copyable
        if (isCopyable) this[OBSTRUCTION_AFFECTABLE] = true;

        let isHovered: boolean = false;

        this.on("onFocus", () => {
            const computedIsCopyable = Component.computePointerLike(isCopyable);

            if (computedIsCopyable) {
                this.context.canvas.style.cursor = "pointer";

                isHovered = true;
            }
        });

        this.on("onBlur", () => {
            const computedIsCopyable = Component.computePointerLike(isCopyable);

            if (computedIsCopyable) {
                this.context.canvas.style.cursor = "default";

                isHovered = false;
            }
        });

        this.on("onClick", () => {
            if (!isHovered) return;

            const computedCopySource = Component.computePointerLike(copySource);

            navigator.clipboard.writeText(computedCopySource).then(
                () => this.emit("onCopySucceed"),
                () => this.emit("onCopyFailed"),
            );
        });
    }

    private calculateSize(ctx: CanvasRenderingContext2D): Pick<LayoutOptions, SizeKeys> {
        const computedFontSize = Component.computePointerLike(this.fontSize);
        const computedText = Component.computePointerLike(this.text);

        ctx.save();

        ctx.reset();

        ctx.font = `${computedFontSize}px Ubuntu`;
        const {
            width,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
        } = ctx.measureText(computedText);

        ctx.restore();

        return {
            w: width + Text.TEXT_WIDTH_OFFSET,
            h: (actualBoundingBoxAscent + actualBoundingBoxDescent) * Text.TEXT_HEIGHT_COEF,
        } as const;
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx } = lc;

        return Layout.layout(
            Object.assign(
                this.calculateSize(ctx),
                Component.computePointerLike(this.layoutOptions),
            ) satisfies LayoutOptions,
            lc,
        );
    }

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        const { ctx } = lc;

        return super.getCacheKey(lc) + CACHE_KEY_DELIMITER +
            Object.values(Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER) + CACHE_KEY_DELIMITER +
            Object.values(this.calculateSize(ctx)).join(CACHE_KEY_DELIMITER);
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

        let x = this.x;
        switch (computedTextAlign) {
            case 'center':
                x += this.w / 2;

                break;

            case 'right':
                x += this.w;

                break;

            case 'left':
            default:

                break;
        }

        const y = this.y + this.h / 2;

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