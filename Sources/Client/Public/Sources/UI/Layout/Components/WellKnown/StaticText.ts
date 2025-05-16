import type { ColorCode } from "../../../../Utils/Color";
import { memo } from "../../../../Utils/Memoize";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component, OBSTRUCTION_AFFECTABLE } from "../Component";
import type { AutomaticallySizedLayoutOptions, SizeKeys } from "./Container";

export const calculateStrokeWidth = memo((fontSize: number): number => {
    return fontSize / 8.333333830038736;
});

export const setGameFont = (ctx: CanvasRenderingContext2D, fontSize: number): void => {
    ctx.strokeStyle = "#000000";
    ctx.font = fontSize + "px Ubuntu";
    ctx.lineWidth = calculateStrokeWidth(fontSize);
};

export type ClipboardEvents = {
    "onCopySucceed": [];
    "onCopyFailed": [];
};

export default class StaticText extends Component<ClipboardEvents> {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    private static readonly TEXT_WIDTH_OFFSET: number = 10;
    private static readonly LINE_HEIGHT_MULTIPLIER: number = 1.4;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        protected readonly text: MaybePointerLike<string>,
        protected readonly fontSize: MaybePointerLike<number>,
        protected readonly fillStyle: MaybePointerLike<ColorCode> = "#ffffff",
        protected readonly textAlign: MaybePointerLike<CanvasTextAlign> = "center",

        protected readonly wordWrapMaxWidth: MaybePointerLike<number | null> = null,

        isCopyable: boolean = false,
        copySource?: MaybePointerLike<string>,
    ) {
        super();

        if (isCopyable && !copySource) {
            throw new Error("Text: text is copyable, but source string is not computable");
        }

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

    private getWrappedLines(
        ctx: CanvasRenderingContext2D,

        text: string,

        maxWidth: number,
    ): Array<string> {
        const words = text.split(" ");
        const lines: Array<string> = new Array();

        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;

            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);

        return lines;
    }

    private calculateSize(ctx: CanvasRenderingContext2D): Pick<LayoutOptions, SizeKeys> {
        const computedFontSize = Component.computePointerLike(this.fontSize);
        const computedText = Component.computePointerLike(this.text);
        const computedTextAlign = Component.computePointerLike(this.textAlign);
        const computedWordWrapMaxWidth = Component.computePointerLike(this.wordWrapMaxWidth);

        ctx.save();

        ctx.textAlign = computedTextAlign;

        setGameFont(ctx, computedFontSize);

        const { LINE_HEIGHT_MULTIPLIER, TEXT_WIDTH_OFFSET } = StaticText;

        let width: number;
        let height: number;

        if (computedWordWrapMaxWidth) {
            const lines = this.getWrappedLines(
                ctx,

                computedText,

                computedWordWrapMaxWidth,
            );
            const lineHeight = computedFontSize * LINE_HEIGHT_MULTIPLIER;

            width = computedWordWrapMaxWidth;
            height = lineHeight * lines.length;
        } else {
            const metrics = ctx.measureText(computedText);

            width = metrics.width + (
                computedTextAlign === "center"
                    ? TEXT_WIDTH_OFFSET
                    : 0
            );
            height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        }

        ctx.restore();

        return {
            w: width,
            h: height,
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

        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER) +
            CACHE_KEY_DELIMITER +
            Object.values(this.calculateSize(ctx)).join(CACHE_KEY_DELIMITER);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        ctx.save();

        const computedFillStyle = Component.computePointerLike(this.fillStyle);
        const computedFontSize = Component.computePointerLike(this.fontSize);
        const computedText = Component.computePointerLike(this.text);
        const computedTextAlign = Component.computePointerLike(this.textAlign);
        const computedWordWrapMaxWidth = Component.computePointerLike(this.wordWrapMaxWidth);

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.textBaseline = "middle";
        ctx.textAlign = computedTextAlign;

        ctx.fillStyle = computedFillStyle;
        setGameFont(ctx, computedFontSize);

        let x = this.x;
        switch (computedTextAlign) {
            case "center":
                x += this.w / 2;

                break;

            case "right":
                x += this.w;

                break;

            case "left":
            default: break;
        }

        const { LINE_HEIGHT_MULTIPLIER } = StaticText;

        if (computedWordWrapMaxWidth) {
            const lines = this.getWrappedLines(
                ctx,

                computedText,

                computedWordWrapMaxWidth,
            );
            const lineHeight = computedFontSize * LINE_HEIGHT_MULTIPLIER;

            lines.forEach((line, index) => {
                const y = this.y + (lineHeight * (index + 0.5));

                ctx.strokeText(line, x, y);
                ctx.fillText(line, x, y);
            });
        } else {
            const y = this.y + this.h / 2;

            ctx.strokeText(computedText, x, y);
            ctx.fillText(computedText, x, y);
        }

        ctx.restore();
    }
}