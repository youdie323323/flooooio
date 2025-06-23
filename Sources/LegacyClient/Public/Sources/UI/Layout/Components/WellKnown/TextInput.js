"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Layout_1 = __importDefault(require("../../Layout"));
const Component_1 = require("../Component");
const StaticText_1 = require("./StaticText");
class TextInput extends Component_1.Component {
    constructor(layoutOptions, options) {
        super();
        this.layoutOptions = layoutOptions;
        // Initialize core properties
        this.canvas = options.canvas;
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        this.value = options.text || "";
        // Initialize style properties
        this.fontSize = options.fontSize || 14;
        this.fontFamily = options.fontFamily || "Ubuntu";
        this.textColor = options.textColor || "#000";
        this.fontWeight = options.fontWeight || "bold";
        this.placeHolderColor = options.placeholderColor || "#BFBEBD";
        this.backgroundColor = options.backgroundColor || "#EEEEEE";
        this.paddingSize = options.paddingSize >= 0 ? options.paddingSize : 5;
        this.borderWidth = options.borderWidth >= 0 ? options.borderWidth : 3;
        this.borderColor = options.borderColor || "#959595";
        this.borderRadius = options.borderRadius >= 0 ? options.borderRadius : 0.5;
        this.highlightColor = options.highlightColor || "#909090";
        // Initialize input state
        this.isReadOnly = options.isReadOnly || false;
        this.maxLength = options.maxLength || null;
        this.isFocused = false;
        // Initialize cursor & selection
        this.cursorOpacity = 0;
        this.isCursorFadingOut = false;
        this.cursorPosition = 0;
        this.selectionRange = [0, 0];
        // Initialize placeholder properties
        this.placeholder = options.placeholder || "";
        this.placeholderUnfocused = options.placeholderUnfocused || "";
        this.showPlaceholderWhenUnfocused = options.showPlaceholderWhenUnfocused || false;
        // Initialize event handlers
        this.onSubmit = options.onSubmit || function () { };
        this.onKeyDown = options.onKeyDown || function () { };
        this.onKeyUp = options.onKeyUp || function () { };
        this.onFocus = options.onFocus || function () { };
        this.onBlur = options.onBlur || function () { };
        if (this.canvas) {
            this.canvas.addEventListener("mousemove", this.mouseMoveHandler = (e) => {
                if (!this.visible) {
                    return;
                }
                this.mousemove(e, this);
            });
            this.canvas.addEventListener("mousedown", this.mouseDownHandler = (e) => {
                if (!this.visible) {
                    return;
                }
                this.mousedown(e, this);
            });
            this.canvas.addEventListener("mouseup", this.mouseUpHandler = (e) => {
                if (!this.visible) {
                    return;
                }
                this.mouseup(e, this);
            });
        }
        this.hiddenInput = document.createElement("input");
        this.hiddenInput.type = "text";
        this.hiddenInput.style.position = "absolute";
        this.hiddenInput.style.opacity = "0";
        this.hiddenInput.style.pointerEvents = "none";
        this.hiddenInput.style.zIndex = "0";
        this.hiddenInput.style.transform = "scale(0)";
        if (this.maxLength) {
            this.hiddenInput.maxLength = this.maxLength;
        }
        document.body.appendChild(this.hiddenInput);
        this.hiddenInput.value = this.value;
        this.hiddenInput.addEventListener("keydown", (e) => {
            if (!this.visible) {
                return;
            }
            if (this.isFocused) {
                this.hiddenInput.focus();
                this.keydown(e, this);
            }
        });
        this.hiddenInput.addEventListener("keyup", (e) => {
            if (!this.visible) {
                return;
            }
            this.value = this.hiddenInput.value;
            this.cursorPosition = this.hiddenInput.selectionStart;
            this.selectionRange = [
                this.hiddenInput.selectionStart,
                this.hiddenInput.selectionEnd,
            ];
            if (this.isFocused) {
                this.onKeyUp(e, this);
            }
        });
        this.on("onBlur", () => {
            this.canvas.style.cursor = "default";
        });
    }
    // Define getter/setter for text
    get value() { return this.text; }
    set value(value) {
        if (this.hiddenInput) {
            this.hiddenInput.value = value;
        }
        this.text = value;
    }
    // Override them to calc wh
    setW(w) {
        this.w = w + 2 * (this.paddingSize + this.borderWidth);
    }
    setH(h) {
        this.h = h + 2 * (this.paddingSize + this.borderWidth);
    }
    layout(lc) {
        return Layout_1.default.layout(Component_1.Component.computePointerLike(this.layoutOptions), lc);
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component_1.Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER);
    }
    invalidateLayoutCache() {
        this.layoutCache.invalidate();
    }
    render(ctx) {
        super.render(ctx);
        ctx.translate(this.x, this.y);
        const text = this.clipText();
        if (this.showPlaceholderWhenUnfocused) {
            this.renderPlaceholderState(text);
        }
        else {
            this.renderTextInput(text);
        }
    }
    renderPlaceholderState(text) {
        if (this.isFocused) {
            this.renderTextInput(text);
            return;
        }
        this.setupTextContext();
        if (this.value.length > 0) {
            this.renderFilledUnfocusedState(text);
        }
        else {
            this.renderEmptyUnfocusedState();
        }
    }
    renderFilledUnfocusedState(text) {
        const { ctx, h } = this;
        this.drawBackgroundOverlay();
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = (0, StaticText_1.calculateStrokeWidth)(this.fontSize);
        ctx.translate(this.paddingSize + this.borderWidth, h / 2);
        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
    }
    renderEmptyUnfocusedState() {
        const { ctx, h } = this;
        this.setupTextContext(true);
        this.drawBackgroundOverlay();
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = (0, StaticText_1.calculateStrokeWidth)(this.fontSize);
        ctx.translate(this.paddingSize + this.borderWidth, h / 2);
        ctx.strokeText(this.placeholderUnfocused, 0, 0);
        ctx.fillText(this.placeholderUnfocused, 0, 0);
    }
    drawBackgroundOverlay() {
        const { ctx, w, h, borderRadius } = this;
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, borderRadius);
        ctx.fill();
        ctx.restore();
    }
    setupTextContext(reduced = false) {
        const { ctx } = this;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.font = `${this.fontWeight} ${this.fontSize - (reduced ? 1 : 0)}px ${this.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
    }
    renderTextInput(text) {
        this.drawBorder();
        this.drawTextBox(() => this.renderTextContent(text));
    }
    drawBorder() {
        const { ctx, w, h, borderRadius } = this;
        if (this.borderWidth <= 0)
            return;
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, borderRadius);
        ctx.fillStyle = this.borderColor;
        ctx.fill();
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    }
    renderTextContent(text) {
        this.clearShadow();
        const hasSelection = this.selectionRange[1] - this.selectionRange[0] > 0;
        if (hasSelection) {
            this.renderSelection(text);
        }
        else {
            this.renderCursor(text);
        }
        this.renderText(text);
    }
    clearShadow() {
        const { ctx } = this;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    }
    renderSelection(text) {
        const { ctx, h } = this;
        const paddingBorder = this.paddingSize + this.borderWidth;
        const selectWidth = this.textWidth(text.substring(this.selectionRange[0], this.selectionRange[1]));
        ctx.save();
        const selectOffset = this.textWidth(text.substring(0, this.selectionRange[0]));
        const heightResized = h * 0.64;
        const WIDTH_OFFSET = 4;
        ctx.fillStyle = this.highlightColor;
        ctx.fillRect(paddingBorder + selectOffset - (WIDTH_OFFSET / 2), (h - heightResized) / 2, selectWidth + WIDTH_OFFSET, heightResized);
        ctx.restore();
    }
    renderCursor(text) {
        const { ctx, h } = this;
        const paddingBorder = this.paddingSize + this.borderWidth;
        ctx.save();
        ctx.globalAlpha = this.cursorOpacity;
        const CURSOR_WIDTH = 1.8;
        const CURSOR_RELATIVE_HEIGHT = 12;
        const cursorOffset = this.textWidth(text.slice(0, this.cursorPosition));
        // Draw black cursor background
        ctx.fillStyle = "#000000";
        ctx.fillRect((paddingBorder + cursorOffset) - 1, CURSOR_RELATIVE_HEIGHT / 2, CURSOR_WIDTH, h - CURSOR_RELATIVE_HEIGHT);
        // Draw white cursor center
        const whiteWidth = CURSOR_WIDTH * 0.65;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect((paddingBorder + cursorOffset + ((CURSOR_WIDTH - whiteWidth) / 2)) - 1, CURSOR_RELATIVE_HEIGHT / 2, whiteWidth, h - CURSOR_RELATIVE_HEIGHT);
        ctx.restore();
    }
    renderText(text) {
        const { ctx, h } = this;
        this.setupTextContext();
        const displayText = text || this.placeholder;
        const normalFillStyle = (this.value && this.value !== this.placeholder)
            ? this.textColor
            : this.placeHolderColor;
        const textY = Math.round(h / 2);
        ctx.translate(0, textY);
        let textX = this.paddingSize + this.borderWidth;
        for (let i = 0; i < displayText.length; i++) {
            const char = displayText[i];
            const isSelected = i >= this.selectionRange[0] && i < this.selectionRange[1];
            if (isSelected) {
                this.renderSelectedChar(char, textX);
            }
            else {
                this.renderNormalChar(char, textX, normalFillStyle);
            }
            textX += this.textWidth(char);
        }
    }
    renderSelectedChar(char, x) {
        const { ctx } = this;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#FFFFFF";
        ctx.lineWidth = (0, StaticText_1.calculateStrokeWidth)(this.fontSize);
        ctx.strokeText(char, x, 0);
        ctx.fillText(char, x, 0);
    }
    renderNormalChar(char, x, fillStyle) {
        const { ctx } = this;
        ctx.fillStyle = fillStyle;
        ctx.fillText(char, x, 0);
    }
    destroy() {
        if (this.isFocused)
            this.blur();
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        document.body.removeChild(this.hiddenInput);
        super.destroy();
    }
    updateCursorStyle(e) {
        if (e) {
            this.canvas.style.cursor =
                this.isFocused
                    ? "text"
                    : "pointer";
        }
    }
    focus(pos = undefined) {
        if (!this.isFocused)
            this.onFocus(this);
        if (!this.isSelectionUpdated) {
            this.selectionRange = [0, 0];
        }
        else {
            delete this.isSelectionUpdated;
        }
        this.isFocused = true;
        if (this.isReadOnly) {
            this.hiddenInput.readOnly = true;
        }
        else {
            this.hiddenInput.readOnly = false;
            this.cursorPosition =
                (typeof pos === "number")
                    ? pos
                    : this.clipText().length;
            if (this.placeholder === this.value) {
                this.value = "";
                this.hiddenInput.value = "";
            }
            if (this.cursorBlinkInterval)
                clearInterval(this.cursorBlinkInterval);
            this.cursorBlinkInterval = setInterval(() => {
                if (this.isCursorFadingOut) {
                    this.cursorOpacity -= 0.1;
                    if (this.cursorOpacity <= 0) {
                        this.isCursorFadingOut = false;
                        this.cursorOpacity = 0;
                    }
                }
                else {
                    this.cursorOpacity += 0.1;
                    if (this.cursorOpacity >= 1) {
                        this.isCursorFadingOut = true;
                        this.cursorOpacity = 1;
                    }
                }
            }, 22.5);
        }
        const hasSelection = (this.selectionRange[0] > 0 || this.selectionRange[1] > 0);
        this.hiddenInput.focus();
        this.hiddenInput.selectionStart = hasSelection ? this.selectionRange[0] : this.cursorPosition;
        this.hiddenInput.selectionEnd = hasSelection ? this.selectionRange[1] : this.cursorPosition;
    }
    blur() {
        this.onBlur(this);
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
        }
        this.isFocused = false;
        this.cursorOpacity = 0;
        this.isCursorFadingOut = false;
        this.selectionRange = [0, 0];
        this.hiddenInput.blur();
        if (this.value === "") {
            this.value = this.placeholder;
        }
    }
    keydown(e, self) {
        const keyCode = e.which;
        if (this.isReadOnly || !this.isFocused) {
            e.preventDefault();
            return;
        }
        if (keyCode === 65 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.selectText();
            return;
        }
        if (keyCode === 17 || e.metaKey || e.ctrlKey) {
            return;
        }
        if (keyCode === 13) {
            e.preventDefault();
            this.onSubmit(e, self);
        }
        // Use rAF to fix input lag
        requestAnimationFrame(() => {
            this.value = this.hiddenInput.value;
            this.cursorPosition = this.hiddenInput.selectionStart;
            this.selectionRange = [
                this.hiddenInput.selectionStart,
                this.hiddenInput.selectionEnd,
            ];
            this.onKeyDown(e, self);
        });
    }
    mousemove(e, self) {
        const { mouseX, mouseY } = this.context, isOver = this.overInput(mouseX, mouseY);
        this.updateCursorStyle(isOver);
        if (this.isFocused && this.selectionStart >= 0) {
            let curPos = this.calculateClickPosition(mouseX);
            if (!isOver) {
                if (mouseX < self.x) {
                    curPos = 0;
                }
                else if (mouseX > self.x + self.w) {
                    curPos = this.value.length;
                }
            }
            const start = Math.min(this.selectionStart, curPos), end = Math.max(this.selectionStart, curPos);
            if (this.selectionRange[0] !== start || this.selectionRange[1] !== end) {
                this.selectionRange = [start, end];
            }
        }
    }
    mousedown(e, self) {
        const { mouseX, mouseY } = this.context, isOver = this.overInput(mouseX, mouseY);
        if (this.isFocused && !isOver) {
            self.blur();
            return;
        }
        // Focus if over
        if (isOver) {
            this.isFocused = true;
            const clickPoisition = this.calculateClickPosition(mouseX);
            self.focus(clickPoisition);
            this.selectionStart = clickPoisition;
        }
        this.updateCursorStyle(isOver);
    }
    mouseup(e, self) {
        const { mouseX } = this.context;
        const clickPoisition = this.calculateClickPosition(mouseX);
        const isSelection = clickPoisition !== this.selectionStart;
        if (this.isFocused && this.selectionStart >= 0 && isSelection) {
            this.isSelectionUpdated = true;
        }
        // Refocus element again
        if (this.isFocused)
            self.focus(clickPoisition);
        delete this.selectionStart;
    }
    drawTextBox(fn) {
        const { ctx, w, h, borderWidth, borderRadius, backgroundColor } = this;
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.roundRect(borderWidth, borderWidth, w - borderWidth * 2, h - borderWidth * 2, borderRadius / 2);
        ctx.fill();
        fn();
    }
    clipText(value = this.value) {
        const padding = this.paddingSize + this.borderWidth;
        const availableWidth = this.w - (2 * padding);
        const textWidth = this.textWidth(value);
        if (textWidth <= availableWidth)
            return value;
        let startPos = 0;
        let endPos = value.length;
        let currentWidth = 0;
        const cursorOffset = this.textWidth(value.substring(0, this.cursorPosition));
        if (cursorOffset > availableWidth) {
            for (let i = 0; i < value.length; i++) {
                currentWidth += this.textWidth(value[i]);
                if (currentWidth + padding > cursorOffset - availableWidth + padding * 2) {
                    startPos = i;
                    break;
                }
            }
        }
        currentWidth = 0;
        for (let i = startPos; i < value.length; i++) {
            currentWidth += this.textWidth(value[i]);
            if (currentWidth > availableWidth) {
                endPos = i;
                break;
            }
        }
        return value.substring(startPos, endPos);
    }
    textWidth(text) {
        const { ctx, fontWeight, fontSize, fontFamily } = this;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = "left";
        // Disable font kerning so 1++ length doesnt have wrong precision
        ctx.fontKerning = "none";
        return ctx.measureText(text).width;
    }
    selectText(range = [0, this.value.length]) {
        this.selectionRange = range.slice();
        this.hiddenInput.selectionStart = range[0];
        this.hiddenInput.selectionEnd = range[1];
    }
    overInput(x, y) {
        const xLeft = x >= this.x, xRight = x <= this.x + this.w, yTop = y >= this.y, yBottom = y <= this.y + this.h;
        return xLeft && xRight && yTop && yBottom;
    }
    calculateClickPosition(x) {
        const text = this.clipText();
        const pos = text.length;
        const relativeX = x - (this.x + this.paddingSize + this.borderWidth);
        const allTextWidth = this.textWidth(text);
        if (relativeX <= 0) {
            return 0;
        }
        if (relativeX >= allTextWidth) {
            return text.length;
        }
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const charWidth = this.textWidth(text[i]);
            const nextTotalWidth = totalWidth + charWidth;
            if (relativeX <= totalWidth + (charWidth / 2)) {
                return i;
            }
            totalWidth = nextTotalWidth;
        }
        return pos;
    }
}
exports.default = TextInput;
