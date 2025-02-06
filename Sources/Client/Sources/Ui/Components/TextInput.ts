import Layout, { LayoutOptions, LayoutResult } from "../Layout/Layout";
import { Component, Interactive, MaybeDynamicLayoutablePointer } from "./Component";
import ExtensionBase from "./Extensions/Extension";
import { calculateStrokeWidth } from "./Text";

interface TextInputOptions {
    canvas: HTMLCanvasElement;
    value?: string;
    selectionColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    fontWeight?: string;
    fontStyle?: string;
    readonly?: boolean;
    maxlength?: number;
    padding?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    placeHolder?: string;
    placeHolderUnfocused?: string;
    placeHolderColor?: string;
    placeHolderDisplayUnfocusedState?: boolean;

    onsubmit?: (e: KeyboardEvent, self: TextInput) => void;
    onkeydown?: (e: KeyboardEvent, self: TextInput) => void;
    onkeyup?: (e: KeyboardEvent, self: TextInput) => void;
    onfocus?: (self: TextInput) => void;
    onblur?: (self: TextInput) => void;
}

const inputs: TextInput[] = [];

export default class TextInput extends ExtensionBase(Component) implements Interactive {
    // Core properties
    private _value: string;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private hiddenInput: HTMLInputElement;
    private inputsIndex: number;

    // Style properties
    private fontSize: number;
    private fontFamily: string;
    private fontColor: string;
    private fontWeight: string;
    private fontStyle: string;
    private placeHolderColor: string;
    private backgroundColor: string | CanvasGradient;
    private padding: number;
    private borderWidth: number;
    private borderColor: string;
    private borderRadius: number;
    private selectionColor: string;

    // Input state
    public hasFocus: boolean;
    private readonly: boolean;
    private maxlength: number | null;
    private mouseDown: boolean;
    private selectionStart?: number;
    private selectionUpdated?: boolean;

    // Cursor & Selection
    private cursorInterval?: NodeJS.Timeout;
    private cursorGlobalAlpha: number;
    private cursorGlobalAlphaDirectionBack: boolean;
    private cursorPos: number;
    private selection: [number, number];

    // Placeholder properties
    private placeHolder: string;
    private placeHolderUnfocused: string;
    private placeHolderDisplayUnfocusedState: boolean;

    // Event handlers
    private onsubmit: (e: KeyboardEvent, self: TextInput) => void;
    private onkeydown: (e: KeyboardEvent, self: TextInput) => void;
    private onkeyup: (e: KeyboardEvent, self: TextInput) => void;
    private onfocus: (self: TextInput) => void;
    private onblur: (self: TextInput) => void;

    // Event listeners
    private onmousemoveListen: (e: any) => void;
    private onmousedownListen: (e: any) => void;
    private onmouseupListen: (e: any) => void;

    constructor(
        protected layout: MaybeDynamicLayoutablePointer<LayoutOptions>,
        o: TextInputOptions,
    ) {
        super();

        // Initialize core properties
        this.canvas = o.canvas;
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.value = (o.value || o.placeHolder || '') + '';

        // Initialize style properties
        this.fontSize = o.fontSize || 14;
        this.fontFamily = o.fontFamily || 'Arial';
        this.fontColor = o.fontColor || '#000';
        this.fontWeight = o.fontWeight || 'normal';
        this.fontStyle = o.fontStyle || 'normal';
        this.placeHolderColor = o.placeHolderColor || '#bfbebd';
        this.backgroundColor = o.backgroundColor || '#fff';
        this.padding = o.padding >= 0 ? o.padding : 5;
        this.borderWidth = o.borderWidth >= 0 ? o.borderWidth : 1;
        this.borderColor = o.borderColor || '#959595';
        this.borderRadius = o.borderRadius >= 0 ? o.borderRadius : 3;
        this.selectionColor = o.selectionColor || '#909090';

        // Initialize input state
        this.readonly = o.readonly || false;
        this.maxlength = o.maxlength || null;
        this.hasFocus = false;
        this.mouseDown = false;

        // Initialize cursor & selection
        this.cursorGlobalAlpha = 0;
        this.cursorGlobalAlphaDirectionBack = false;
        this.cursorPos = 0;
        this.selection = [0, 0];

        // Initialize placeholder properties
        this.placeHolder = o.placeHolder || '';
        this.placeHolderUnfocused = o.placeHolderUnfocused || '';
        this.placeHolderDisplayUnfocusedState = o.placeHolderDisplayUnfocusedState || false;

        // Initialize event handlers
        this.onsubmit = o.onsubmit || function () { };
        this.onkeydown = o.onkeydown || function () { };
        this.onkeyup = o.onkeyup || function () { };
        this.onfocus = o.onfocus || function () { };
        this.onblur = o.onblur || function () { };

        if (this.canvas) {
            this.canvas.addEventListener('mousemove', this.onmousemoveListen = (e: MouseEvent) => {
                if (!this.visible) {
                    return;
                }

                this.mousemove(e, this);
            });

            this.canvas.addEventListener('mousedown', this.onmousedownListen = (e: MouseEvent) => {
                if (!this.visible) {
                    return;
                }

                this.mousedown(e, this);
            });

            this.canvas.addEventListener('mouseup', this.onmouseupListen = (e: MouseEvent) => {
                if (!this.visible) {
                    return;
                }

                this.mouseup(e, this);
            });
        }

        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'text';
        this.hiddenInput.style.position = 'absolute';
        this.hiddenInput.style.opacity = "0";
        this.hiddenInput.style.pointerEvents = 'none';
        this.hiddenInput.style.zIndex = "0";

        this.hiddenInput.style.transform = 'scale(0)';

        if (this.maxlength) {
            this.hiddenInput.maxLength = this.maxlength;
        }

        document.body.appendChild(this.hiddenInput);

        this.hiddenInput.value = this.value;

        this.hiddenInput.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.visible) {
                return;
            }

            if (this.hasFocus) {
                this.hiddenInput.focus();

                this.keydown(e, this);
            }
        });

        this.hiddenInput.addEventListener('keyup', (e: KeyboardEvent) => {
            if (!this.visible) {
                return;
            }

            this.value = this.hiddenInput.value;
            this.cursorPos = this.hiddenInput.selectionStart;

            this.selection = [
                this.hiddenInput.selectionStart,
                this.hiddenInput.selectionEnd
            ];

            if (this.hasFocus) {
                this.onkeyup(e, this);
            }
        });

        inputs.push(this);
        this.inputsIndex = inputs.length - 1;
    }

    // Define getter/setter for _value
    public get value() { return this._value }
    public set value(value: string) {
        if (this.hiddenInput) {
            this.hiddenInput.value = value;
        }

        this._value = value;
    }

    // Override them to calc wh
    public override setW(w: number) {
        this.w = w + this.padding * 2 + this.borderWidth * 2;
    }
    public override setH(h: number) {
        this.h = h + this.padding * 2 + this.borderWidth * 2;
    }

    public calculateLayout(
        width: number,
        height: number,
        originX: number = 0,
        originY: number = 0
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

    public override render() {
        const ctx = this.ctx, w = this.w, h = this.h, br = this.borderRadius;

        if (!ctx) {
            return;
        }

        super.render(ctx);

        this.update();

        ctx.translate(this.x, this.y);

        const drawFocusing = (): void => {
            if (this.borderWidth > 0) {
                ctx.fillStyle = this.borderColor;
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, br);
                ctx.fill();

                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;
            }

            this.drawTextBox(() => {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;

                const paddingBorder = this.padding + this.borderWidth,
                    selectWidth = this.textWidth(text.substring(this.selection[0], this.selection[1]));

                if (selectWidth !== 0) {
                    const selectOffset = this.textWidth(text.substring(0, this.selection[0]));

                    ctx.fillStyle = this.selectionColor;

                    const heightResized = h * 0.64;
                    const WIDTH_OFFSET = 4;
                    ctx.fillRect(
                        paddingBorder + selectOffset - ((selectWidth === 0 ? 0 : WIDTH_OFFSET) / 2),
                        (h - heightResized) / 2,
                        selectWidth + WIDTH_OFFSET,
                        heightResized,
                    );
                } else {
                    ctx.save();

                    ctx.globalAlpha = this.cursorGlobalAlpha;

                    const CURSOR_SIZE_WIDTH = 2.2;

                    const cursorOffset = this.textWidth(text.slice(0, this.cursorPos));

                    ctx.fillStyle = "#000000";
                    ctx.fillRect((paddingBorder + cursorOffset) - 1, 10 / 2, CURSOR_SIZE_WIDTH, h - 10);

                    const whiteWidth = CURSOR_SIZE_WIDTH * 0.65;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect((paddingBorder + cursorOffset + ((CURSOR_SIZE_WIDTH - whiteWidth) / 2)) - 1, 10 / 2, whiteWidth, h - 10);

                    ctx.restore();
                }

                let textX = this.padding + this.borderWidth, textY = Math.round(h / 2);

                text = (text === '' && this.placeHolder) ? this.placeHolder : text;

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                const normalFillStyle = (this.value !== '' && this.value !== this.placeHolder) ? this.fontColor : this.placeHolderColor;

                ctx.translate(0, textY);

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];

                    if (i >= this.selection[0] && i < this.selection[1]) {
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "#ffffff";
                        ctx.lineWidth = calculateStrokeWidth(this.fontSize);

                        ctx.strokeText(char, textX, 0);
                        ctx.fillText(char, textX, 0);
                    } else {
                        ctx.fillStyle = normalFillStyle;

                        ctx.fillText(char, textX, 0);
                    }

                    textX += this.textWidth(char);
                }
            });
        };

        let text = this.clipText();

        if (this.placeHolderDisplayUnfocusedState) {
            if (this.hasFocus) {
                drawFocusing();
            } else if (this.value.length > 0) {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                ctx.save();

                ctx.globalAlpha = 0.4;
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, br);
                ctx.fill();

                ctx.restore();

                ctx.fillStyle = "#000000";
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = calculateStrokeWidth(this.fontSize);

                ctx.translate(this.padding + this.borderWidth, h / 2);

                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            } else {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + (this.fontSize - 1) + 'px ' + this.fontFamily;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                ctx.save();

                ctx.globalAlpha = 0.4;
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, br);
                ctx.fill();

                ctx.restore();

                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = calculateStrokeWidth(this.fontSize);

                ctx.translate(this.padding + this.borderWidth, h / 2);

                ctx.strokeText(this.placeHolderUnfocused, 0, 0);
                ctx.fillText(this.placeHolderUnfocused, 0, 0);
            }
        } else {
            drawFocusing();
        }
    }

    public override destroy() {
        super.destroy();

        const index = inputs.indexOf(this);
        if (index != -1) {
            inputs.splice(index, 1);
        }

        if (this.hasFocus) {
            this.blur();
        }

        this.canvas.removeEventListener('mousemove', this.onmousemoveListen);
        this.canvas.removeEventListener('mousedown', this.onmousedownListen);
        this.canvas.removeEventListener('mouseup', this.onmouseupListen);

        document.body.removeChild(this.hiddenInput);
    }

    public onFocus(): void { }

    public onBlur(): void {
        this.canvas.style.cursor = "default";
    }

    private updateCursorStyle(e: boolean): void {
        if (e) {
            this.canvas.style.cursor = this.hasFocus ? "text" : "pointer";
        }
    }

    public focus(pos: number = undefined) {
        if (!this.hasFocus) {
            this.onfocus(this);

            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].hasFocus) {
                    inputs[i].blur();
                }
            }
        }

        if (!this.selectionUpdated) {
            this.selection = [0, 0];
        } else {
            delete this.selectionUpdated;
        }

        this.hasFocus = true;
        if (this.readonly) {
            this.hiddenInput.readOnly = true;
        } else {
            this.hiddenInput.readOnly = false;

            this.cursorPos = (typeof pos === 'number') ? pos : this.clipText().length;

            if (this.placeHolder === this.value) {
                this.value = '';
                this.hiddenInput.value = '';
            }

            if (this.cursorInterval) clearInterval(this.cursorInterval);

            this.cursorInterval = setInterval(() => {
                if (this.cursorGlobalAlphaDirectionBack) {
                    this.cursorGlobalAlpha -= 0.1;
                    if (this.cursorGlobalAlpha <= 0) {
                        this.cursorGlobalAlphaDirectionBack = false;
                        this.cursorGlobalAlpha = 0;
                    }
                } else {
                    this.cursorGlobalAlpha += 0.1;
                    if (this.cursorGlobalAlpha >= 1) {
                        this.cursorGlobalAlphaDirectionBack = true;
                        this.cursorGlobalAlpha = 1;
                    }
                }
            }, 22.5);
        }

        const hasSelection = (this.selection[0] > 0 || this.selection[1] > 0);
        this.hiddenInput.focus();
        this.hiddenInput.selectionStart = hasSelection ? this.selection[0] : this.cursorPos;
        this.hiddenInput.selectionEnd = hasSelection ? this.selection[1] : this.cursorPos;
    }

    public blur() {
        this.onblur(this);

        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }
        this.hasFocus = false;
        this.cursorGlobalAlpha = 0;
        this.cursorGlobalAlphaDirectionBack = false;
        this.selection = [0, 0];
        this.hiddenInput.blur();

        if (this.value === '') {
            this.value = this.placeHolder;
        }
    }

    private keydown(e: KeyboardEvent, self: this) {
        const keyCode = e.which;

        if (this.readonly || !this.hasFocus) {
            e.preventDefault();

            return;
        }

        this.onkeydown(e, self);

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

            this.onsubmit(e, self);
        } else if (keyCode === 9) {
            e.preventDefault();

            if (inputs.length > 1) {
                const next = (inputs[this.inputsIndex + 1]) ? this.inputsIndex + 1 : 0;
                self.blur();
                setTimeout(function () {
                    inputs[next].focus();
                }, 10);
            }
        }

        // Use rAF to fix input lag
        requestAnimationFrame(() => {
            this.value = this.hiddenInput.value;
            this.cursorPos = this.hiddenInput.selectionStart;
            this.selection = [
                this.hiddenInput.selectionStart,
                this.hiddenInput.selectionEnd
            ];
        });
    }

    private mousemove(e: MouseEvent, self: this) {
        const x = this.context.mouseX, y = this.context.mouseY, isOver = this.overInput(x, y);

        this.updateCursorStyle(isOver);

        if (this.hasFocus && this.selectionStart >= 0) {
            let curPos = this.clickPos(x, y);

            if (!isOver) {
                if (x < self.x) {
                    curPos = 0;
                } else if (x > self.x + self.w) {
                    curPos = this.value.length;
                }
            }

            const start = Math.min(this.selectionStart, curPos),
                end = Math.max(this.selectionStart, curPos);

            if (this.selection[0] !== start || this.selection[1] !== end) {
                this.selection = [start, end];
            }
        }
    }

    private mousedown(e: MouseEvent, self: this) {
        const x = this.context.mouseX, y = this.context.mouseY, isOver = this.overInput(x, y);

        this.mouseDown = isOver;

        if (this.hasFocus && !isOver) {
            self.blur();
            return;
        }

        // Focus if over
        if (this.mouseDown) {
            this.hasFocus = true;
            self.focus(this.clickPos(x, y));
        }

        if (this.hasFocus && this.mouseDown) {
            this.selectionStart = this.clickPos(x, y);
        }
    }

    private mouseup(e: MouseEvent, self: this) {
        const x = this.context.mouseX, y = this.context.mouseY, isOver = this.overInput(x, y);

        this.updateCursorStyle(isOver);

        const isSelection = this.clickPos(x, y) !== this.selectionStart;
        if (this.hasFocus && this.selectionStart >= 0 && isSelection) {
            this.selectionUpdated = true;
        }

        // Refocus element again
        if (this.hasFocus) self.focus(this.clickPos(x, y));

        delete this.selectionStart;
    }

    private drawTextBox(fn: () => void) {
        const ctx = this.ctx, w = this.w, h = this.h, br = this.borderRadius, bw = this.borderWidth;

        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(bw, bw, w - bw * 2, h - bw * 2, br - 2);
        ctx.fill();

        fn();
    }

    private clipText(value: string = undefined) {
        value = (typeof value === 'undefined') ? this.value : value;

        const padding = this.padding + this.borderWidth;
        const availableWidth = this.w - (padding * 2);
        const textWidth = this.textWidth(value);

        if (textWidth <= availableWidth) {
            return value;
        }

        let startPos = 0;
        let endPos = value.length;
        let currentWidth = 0;
        const cursorOffset = this.textWidth(value.substring(0, this.cursorPos));

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

    private textWidth(text: string) {
        const ctx = this.ctx;

        ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
        ctx.textAlign = 'left';
        // Disable font kerning so 1++ length doesnt have wrong precision
        ctx.fontKerning = 'none';

        return ctx.measureText(text).width;
    }

    private selectText(range: [number, number] = undefined) {
        range = range || [0, this.value.length];

        this.selection = <[number, number]>range.slice();
        this.hiddenInput.selectionStart = range[0];
        this.hiddenInput.selectionEnd = range[1];
    }

    private overInput(x: number, y: number) {
        const xLeft = x >= this.x,
            xRight = x <= this.x + this.w,
            yTop = y >= this.y,
            yBottom = y <= this.y + this.h;

        return xLeft && xRight && yTop && yBottom;
    }

    private clickPos(x: number, y: number) {
        const text = this.clipText();
        const pos = text.length;

        const relativeX = x - (this.x + this.padding + this.borderWidth);

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