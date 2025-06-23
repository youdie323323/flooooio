"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGameFont = exports.calculateStrokeWidth = void 0;
const Memoize_1 = require("../../../../Utils/Memoize");
const Layout_1 = __importDefault(require("../../Layout"));
const Component_1 = require("../Component");
exports.calculateStrokeWidth = (0, Memoize_1.memo)((fontSize) => {
    return fontSize / 8.333333830038736;
});
const setGameFont = (ctx, fontSize) => {
    ctx.strokeStyle = "#000000";
    ctx.font = fontSize + "px Ubuntu";
    ctx.lineWidth = (0, exports.calculateStrokeWidth)(fontSize);
};
exports.setGameFont = setGameFont;
class StaticText extends Component_1.Component {
    static { _a = Component_1.OBSTRUCTION_AFFECTABLE; }
    static { this.TEXT_WIDTH_OFFSET = 10; }
    static { this.LINE_HEIGHT_MULTIPLIER = 1.4; }
    constructor(layoutOptions, text, fontSize, fillStyle = "#ffffff", textAlign = "center", wordWrapMaxWidth = null, isCopyable = false, copySource) {
        super();
        this.layoutOptions = layoutOptions;
        this.text = text;
        this.fontSize = fontSize;
        this.fillStyle = fillStyle;
        this.textAlign = textAlign;
        this.wordWrapMaxWidth = wordWrapMaxWidth;
        this[_a] = false;
        if (isCopyable && !copySource) {
            throw new Error("Text: text is copyable, but source string is not computable");
        }
        if (isCopyable)
            this[Component_1.OBSTRUCTION_AFFECTABLE] = true;
        let isHovered = false;
        this.on("onFocus", () => {
            const computedIsCopyable = Component_1.Component.computePointerLike(isCopyable);
            if (computedIsCopyable) {
                this.context.canvas.style.cursor = "pointer";
                isHovered = true;
            }
        });
        this.on("onBlur", () => {
            const computedIsCopyable = Component_1.Component.computePointerLike(isCopyable);
            if (computedIsCopyable) {
                this.context.canvas.style.cursor = "default";
                isHovered = false;
            }
        });
        this.on("onClick", () => {
            if (!isHovered)
                return;
            const computedCopySource = Component_1.Component.computePointerLike(copySource);
            navigator.clipboard.writeText(computedCopySource).then(() => this.emit("onCopySucceed"), () => this.emit("onCopyFailed"));
        });
    }
    getWrappedLines(ctx, text, maxWidth) {
        const words = text.split(" ");
        const lines = new Array();
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const { width } = ctx.measureText(currentLine + " " + word);
            if (width < maxWidth) {
                currentLine += " " + word;
            }
            else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    calculateSize(ctx) {
        const computedFontSize = Component_1.Component.computePointerLike(this.fontSize);
        const computedText = Component_1.Component.computePointerLike(this.text);
        const computedTextAlign = Component_1.Component.computePointerLike(this.textAlign);
        const computedWordWrapMaxWidth = Component_1.Component.computePointerLike(this.wordWrapMaxWidth);
        ctx.save();
        ctx.textAlign = computedTextAlign;
        (0, exports.setGameFont)(ctx, computedFontSize);
        const { LINE_HEIGHT_MULTIPLIER, TEXT_WIDTH_OFFSET } = StaticText;
        let width;
        let height;
        if (computedWordWrapMaxWidth) {
            const lines = this.getWrappedLines(ctx, computedText, computedWordWrapMaxWidth);
            const lineHeight = computedFontSize * LINE_HEIGHT_MULTIPLIER;
            width = computedWordWrapMaxWidth;
            height = lineHeight * lines.length;
        }
        else {
            const metrics = ctx.measureText(computedText);
            width = metrics.width + (computedTextAlign === "center"
                ? TEXT_WIDTH_OFFSET
                : 0);
            height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        }
        ctx.restore();
        return {
            w: width,
            h: height,
        };
    }
    layout(lc) {
        const { ctx } = lc;
        return Layout_1.default.layout(Object.assign(this.calculateSize(ctx), Component_1.Component.computePointerLike(this.layoutOptions)), lc);
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        const { ctx } = lc;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component_1.Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER) +
            CACHE_KEY_DELIMITER +
            Object.values(this.calculateSize(ctx)).join(CACHE_KEY_DELIMITER);
    }
    invalidateLayoutCache() {
        this.layoutCache.invalidate();
    }
    render(ctx) {
        super.render(ctx);
        ctx.save();
        const computedFillStyle = Component_1.Component.computePointerLike(this.fillStyle);
        const computedFontSize = Component_1.Component.computePointerLike(this.fontSize);
        const computedText = Component_1.Component.computePointerLike(this.text);
        const computedTextAlign = Component_1.Component.computePointerLike(this.textAlign);
        const computedWordWrapMaxWidth = Component_1.Component.computePointerLike(this.wordWrapMaxWidth);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.textBaseline = "middle";
        ctx.textAlign = computedTextAlign;
        ctx.fillStyle = computedFillStyle;
        (0, exports.setGameFont)(ctx, computedFontSize);
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
            const lines = this.getWrappedLines(ctx, computedText, computedWordWrapMaxWidth);
            const lineHeight = computedFontSize * LINE_HEIGHT_MULTIPLIER;
            lines.forEach((line, index) => {
                const y = this.y + (lineHeight * (index + 0.5));
                ctx.strokeText(line, x, y);
                ctx.fillText(line, x, y);
            });
        }
        else {
            const y = this.y + this.h / 2;
            ctx.strokeText(computedText, x, y);
            ctx.fillText(computedText, x, y);
        }
        ctx.restore();
    }
}
exports.default = StaticText;
