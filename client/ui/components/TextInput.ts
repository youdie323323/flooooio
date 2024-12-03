import { calculateStrokeWidth } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { uiScaleFactor } from "../UserInterface";
import { Component, Interactive, MaybeDynamicLayoutablePointer } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

// Fork of CanvasInput

interface CanvasInputOptions {
    canvas?: HTMLCanvasElement;
    extraX?: number;
    extraY?: number;
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    placeHolderColor?: string;
    fontWeight?: string;
    fontStyle?: string;
    fontShadowColor?: string;
    fontShadowBlur?: number;
    fontShadowOffsetX?: number;
    fontShadowOffsetY?: number;
    readonly?: boolean;
    maxlength?: number;
    padding?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    backgroundImage?: string;
    selectionColor?: string;
    placeHolder?: string;
    placeHolderUnfocused?: string;
    value?: string;
    backgroundGradient?: string[];
    backgroundColor?: string;
    unfocusedState?: boolean;
    onsubmit?: (e?: Event, self?: TextInput) => void;
    onkeydown?: (e?: KeyboardEvent, self?: TextInput) => void;
    onkeyup?: (e?: KeyboardEvent, self?: TextInput) => void;
    onfocus?: (self: TextInput) => void;
    onblur?: (self: TextInput) => void;
}

const inputs: TextInput[] = [];

export default class TextInput extends ExtensionPlaceholder(Component) implements Interactive {
    // Make it accessible from outside
    private _value: string;
    private _canvas: HTMLCanvasElement | null;
    private _ctx: CanvasRenderingContext2D | null;
    private _extraX: number;
    private _extraY: number;
    private _fontSize: number;
    private _fontFamily: string;
    private _fontColor: string;
    private _placeHolderColor: string;
    private _fontWeight: string;
    private _fontStyle: string;
    private _fontShadowColor: string;
    private _fontShadowBlur: number;
    private _fontShadowOffsetX: number;
    private _fontShadowOffsetY: number;
    private _readonly: boolean;
    private _maxlength: number | null;
    private _padding: number;
    private _borderWidth: number;
    private _borderColor: string;
    private _borderRadius: number;
    private _backgroundImage: string;
    private _selectionColor: string;
    private _placeHolder: string;
    private _placeHolderUnfocused: string;
    private _onsubmit: (e?: Event, self?: TextInput) => void;
    private _onkeydown: (e?: KeyboardEvent, self?: TextInput) => void;
    private _onkeyup: (e?: KeyboardEvent, self?: TextInput) => void;
    private _onfocus: (self: TextInput) => void;
    private _onblur: (self: TextInput) => void;
    private _cursorGlobalAlpha: number;
    private _cursorGlobalAlphaBack: boolean;
    private _cursorPos: number;
    private _selection: [number, number];
    private _hasFocus: boolean;
    private _backgroundColor: string | CanvasGradient;
    private _hiddenInput: HTMLInputElement;
    private _inputsIndex: number;
    private _mouseDown: boolean;
    private _selectionStart?: number;
    private _selectionUpdated?: boolean;
    private _cursorInterval?: NodeJS.Timeout;
    private _unfocusedState: boolean;

    constructor(
        protected layout: MaybeDynamicLayoutablePointer<LayoutOptions>,
        o: CanvasInputOptions = {},
    ) {
        super();

        let self = this;

        self._canvas = o.canvas || null;
        self._ctx = self._canvas ? self._canvas.getContext('2d') : null;
        self._extraX = o.extraX || 0;
        self._extraY = o.extraY || 0;
        self._fontSize = o.fontSize || 14;
        self._fontFamily = o.fontFamily || 'Arial';
        self._fontColor = o.fontColor || '#000';
        self._placeHolderColor = o.placeHolderColor || '#bfbebd';
        self._fontWeight = o.fontWeight || 'normal';
        self._fontStyle = o.fontStyle || 'normal';
        self._fontShadowColor = o.fontShadowColor || '';
        self._fontShadowBlur = o.fontShadowBlur || 0;
        self._fontShadowOffsetX = o.fontShadowOffsetX || 0;
        self._fontShadowOffsetY = o.fontShadowOffsetY || 0;
        self._readonly = o.readonly || false;
        self._maxlength = o.maxlength || null;
        self._padding = o.padding >= 0 ? o.padding : 5;
        self._borderWidth = o.borderWidth >= 0 ? o.borderWidth : 1;
        self._borderColor = o.borderColor || '#959595';
        self._borderRadius = o.borderRadius >= 0 ? o.borderRadius : 3;
        self._backgroundImage = o.backgroundImage || '';
        self._selectionColor = o.selectionColor || '#909090';
        self._placeHolder = o.placeHolder || '';
        self._placeHolderUnfocused = o.placeHolderUnfocused || '';
        self._value = (o.value || self._placeHolder) + '';
        self._onsubmit = o.onsubmit || function () { };
        self._onkeydown = o.onkeydown || function () { };
        self._onkeyup = o.onkeyup || function () { };
        self._onfocus = o.onfocus || function () { };
        self._onblur = o.onblur || function () { };
        self._cursorGlobalAlpha = 0;
        self._cursorGlobalAlphaBack = false;
        self._cursorPos = 0;
        self._hasFocus = false;
        self._selection = [0, 0];
        self._unfocusedState = o.unfocusedState || false;

        self._backgroundColor = o.backgroundColor || '#fff';

        if (self._canvas) {
            self._canvas.addEventListener('mousemove', function (e: any) {
                if (!self.visible) {
                    return;
                }

                e = e || window.event;
                self.mousemove(e, self);
            }, false);

            self._canvas.addEventListener('mousedown', function (e: any) {
                if (!self.visible) {
                    return;
                }

                e = e || window.event;
                self.mousedown(e, self);
            }, false);

            self._canvas.addEventListener('mouseup', function (e: any) {
                if (!self.visible) {
                    return;
                }

                e = e || window.event;
                self.mouseup(e, self);
            }, false);
        }

        self._hiddenInput = document.createElement('input');
        self._hiddenInput.type = 'text';
        self._hiddenInput.style.position = 'absolute';
        self._hiddenInput.style.opacity = "0";
        self._hiddenInput.style.pointerEvents = 'none';
        self._hiddenInput.style.zIndex = "0";

        self._hiddenInput.style.transform = 'scale(0)';

        if (self._maxlength) {
            self._hiddenInput.maxLength = self._maxlength;
        }

        document.body.appendChild(self._hiddenInput);

        self._hiddenInput.value = self._value;

        self._hiddenInput.addEventListener('keydown', function (e: any) {
            if (!self.visible) {
                return;
            }

            e = e || window.event;

            if (self._hasFocus) {
                self._hiddenInput.focus();

                self.keydown(e, self);
            }
        });

        self._hiddenInput.addEventListener('keyup', function (e: any) {
            if (!self.visible) {
                return;
            }

            e = e || window.event;

            self._value = self._hiddenInput.value;
            self._cursorPos = self._hiddenInput.selectionStart;

            self._selection = [self._hiddenInput.selectionStart, self._hiddenInput.selectionEnd];

            if (self._hasFocus) {
                self._onkeyup(e, self);
            }
        });

        inputs.push(self);
        self._inputsIndex = inputs.length - 1;
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

    public canvas(data: HTMLCanvasElement = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._canvas = data;
            self._ctx = self._canvas.getContext('2d');
        } else {
            return self._canvas;
        }
    }

    public extraX(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._extraX = data;
        } else {
            return self._extraX;
        }
    }

    public extraY(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._extraY = data;
        } else {
            return self._extraY;
        }
    }

    public fontSize(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontSize = data;
        } else {
            return self._fontSize;
        }
    }

    public fontFamily(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontFamily = data;
        } else {
            return self._fontFamily;
        }
    }

    public fontColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontColor = data;
        } else {
            return self._fontColor;
        }
    }

    public placeHolderColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._placeHolderColor = data;
        } else {
            return self._placeHolderColor;
        }
    }

    public fontWeight(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontWeight = data;
        } else {
            return self._fontWeight;
        }
    }

    public fontStyle(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontStyle = data;
        } else {
            return self._fontStyle;
        }
    }

    public fontShadowColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowColor = data;
        } else {
            return self._fontShadowColor;
        }
    }

    public fontShadowBlur(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowBlur = data;
        } else {
            return self._fontShadowBlur;
        }
    }

    public fontShadowOffsetX(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowOffsetX = data;
        } else {
            return self._fontShadowOffsetX;
        }
    }

    public fontShadowOffsetY(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowOffsetY = data;
        } else {
            return self._fontShadowOffsetY;
        }
    }

    public padding(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._padding = data;
        } else {
            return self._padding;
        }
    }

    public borderWidth(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._borderWidth = data;
        } else {
            return self._borderWidth;
        }
    }

    public borderColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._borderColor = data;
        } else {
            return self._borderColor;
        }
    }

    public borderRadius(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._borderRadius = data;
        } else {
            return self._borderRadius;
        }
    }

    public backgroundColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._backgroundColor = data;
        } else {
            return self._backgroundColor;
        }
    }

    public selectionColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._selectionColor = data;
        } else {
            return self._selectionColor;
        }
    }

    public placeHolder(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._placeHolder = data;
        } else {
            return self._placeHolder;
        }
    }

    public hasFocus(data: boolean = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._hasFocus = data;
        } else {
            return self._hasFocus;
        }
    }

    public value(data: { toString(): string } = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._value = data + '';
            self._hiddenInput.value = data + '';

            self._cursorPos = self._clipText().length;
        } else {
            return (self._value === self._placeHolder) ? '' : self._value;
        }
    }

    public onsubmit(fn: (e?: Event, self?: TextInput) => void = undefined) {
        let self = this;

        if (typeof fn !== 'undefined') {
            self._onsubmit = fn;
        } else {
            self._onsubmit();
        }
    }

    public onkeydown(fn: (e?: KeyboardEvent, self?: TextInput) => void = undefined) {
        let self = this;

        if (typeof fn !== 'undefined') {
            self._onkeydown = fn;
        } else {
            self._onkeydown();
        }
    }

    public onkeyup(fn: (e?: KeyboardEvent, self?: TextInput) => void = undefined) {
        let self = this;

        if (typeof fn !== 'undefined') {
            self._onkeyup = fn;
        } else {
            self._onkeyup();
        }
    }

    public focus(pos: number = undefined) {
        let self = this;

        if (!self._hasFocus) {
            self._onfocus(self);

            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i]._hasFocus) {
                    inputs[i].blur();
                }
            }
        }

        if (!self._selectionUpdated) {
            self._selection = [0, 0];
        } else {
            delete self._selectionUpdated;
        }

        self._hasFocus = true;
        if (self._readonly) {
            self._hiddenInput.readOnly = true;
        } else {
            self._hiddenInput.readOnly = false;

            self._cursorPos = (typeof pos === 'number') ? pos : self._clipText().length;

            if (self._placeHolder === self._value) {
                self._value = '';
                self._hiddenInput.value = '';
            }

            if (self._cursorInterval) clearInterval(self._cursorInterval);

            self._cursorInterval = setInterval(function () {
                if (self._cursorGlobalAlphaBack) {
                    self._cursorGlobalAlpha -= 0.1;
                    if (self._cursorGlobalAlpha <= 0) {
                        self._cursorGlobalAlphaBack = false;
                        self._cursorGlobalAlpha = 0;
                    }
                } else {
                    self._cursorGlobalAlpha += 0.1;
                    if (self._cursorGlobalAlpha >= 1) {
                        self._cursorGlobalAlphaBack = true;
                        self._cursorGlobalAlpha = 1;
                    }
                }
            }, 22.5);
        }

        let hasSelection = (self._selection[0] > 0 || self._selection[1] > 0);
        self._hiddenInput.focus();
        self._hiddenInput.selectionStart = hasSelection ? self._selection[0] : self._cursorPos;
        self._hiddenInput.selectionEnd = hasSelection ? self._selection[1] : self._cursorPos;
    }

    public blur() {
        let self = this;

        self._onblur(self);

        if (self._cursorInterval) {
            clearInterval(self._cursorInterval);
        }
        self._hasFocus = false;
        self._cursorGlobalAlpha = 0;
        self._cursorGlobalAlphaBack = false;
        self._selection = [0, 0];
        self._hiddenInput.blur();

        if (self._value === '') {
            self._value = self._placeHolder;
        }
    }

    private keydown(e: KeyboardEvent, self: this) {
        let keyCode = e.which;

        if (self._readonly || !self._hasFocus) {
            e.preventDefault();

            return;
        }

        self._onkeydown(e, self);

        if (keyCode === 65 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();

            self._selectText();
            return;
        }

        if (keyCode === 17 || e.metaKey || e.ctrlKey) {
            return;
        }

        if (keyCode === 13) {
            e.preventDefault();

            self._onsubmit(e, self);
        } else if (keyCode === 9) {
            e.preventDefault();

            if (inputs.length > 1) {
                let next = (inputs[self._inputsIndex + 1]) ? self._inputsIndex + 1 : 0;
                self.blur();
                setTimeout(function () {
                    inputs[next].focus();
                }, 10);
            }
        }

        // Use rAF to fix input lag
        requestAnimationFrame(() => {
            self._value = self._hiddenInput.value;
            self._cursorPos = self._hiddenInput.selectionStart;
            self._selection = [
                self._hiddenInput.selectionStart,
                self._hiddenInput.selectionEnd
            ];
        });
    }

    private mousemove(e: MouseEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y, isOver = self._overInput(x, y);

        if (self._hasFocus && self._selectionStart >= 0) {
            let curPos = self._clickPos(x, y);

            if (!isOver) {
                if (x < self.x) {
                    curPos = 0;
                } else if (x > self.x + self.w) {
                    curPos = self._value.length;
                }
            }

            let start = Math.min(self._selectionStart, curPos),
                end = Math.max(self._selectionStart, curPos);

            if (self._selection[0] !== start || self._selection[1] !== end) {
                self._selection = [start, end];
            }
        }
    }

    private mousedown(e: MouseEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y, isOver = self._overInput(x, y);

        self._mouseDown = isOver;

        if (self._hasFocus && !isOver) {
            self.blur();
            return;
        }

        // Focus if over
        if (self._mouseDown) {
            self._hasFocus = true;
            self.focus(self._clickPos(x, y));
        }

        if (self._hasFocus && self._mouseDown) {
            self._selectionStart = self._clickPos(x, y);
        }
    }

    private mouseup(e: MouseEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y;

        let isSelection = self._clickPos(x, y) !== self._selectionStart;
        if (self._hasFocus && self._selectionStart >= 0 && isSelection) {
            self._selectionUpdated = true;
        }

        // Refocus element again
        if (self._hasFocus) self.focus(self._clickPos(x, y));

        delete self._selectionStart;
    }

    private _selectText(range: [number, number] = undefined) {
        let self = this;
        range = range || [0, self._value.length];

        self._selection = [range[0], range[1]];
        self._hiddenInput.selectionStart = range[0];
        self._hiddenInput.selectionEnd = range[1];
    }

    private _getCursorStyle(_hasFocus: boolean): string {
        return _hasFocus ? "text" : "pointer";
    }

    public onFocus(): void {
        let self = this;

        // TODO: do this on mousemove

        self._canvas.style.cursor = this._getCursorStyle(self._hasFocus);
    }

    public onBlur(): void {
        let self = this;

        self._canvas.style.cursor = "default";
    }

    public render() {
        const self = this, ctx = self._ctx, w = self.w, h = self.h, br = self._borderRadius;

        if (!ctx) {
            return;
        }

        super.render(ctx);

        this.update();

        ctx.translate(self.x, self.y);

        const drawFocusing = (): void => {
            if (self._borderWidth > 0) {
                ctx.fillStyle = self._borderColor;
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, br);
                ctx.fill();

                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;
            }

            self._drawTextBox(function () {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;

                const paddingBorder = self._padding + self._borderWidth,
                    selectWidth = self._textWidth(text.substring(self._selection[0], self._selection[1]));

                if (selectWidth !== 0) {
                    const selectOffset = self._textWidth(text.substring(0, self._selection[0]));

                    ctx.fillStyle = self._selectionColor;

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

                    ctx.globalAlpha = self._cursorGlobalAlpha;

                    const CURSOR_SIZE_WIDTH = 2.2;

                    const cursorOffset = self._textWidth(text.slice(0, self._cursorPos));

                    ctx.fillStyle = "#000000";
                    ctx.fillRect((paddingBorder + cursorOffset) - 1, 10 / 2, CURSOR_SIZE_WIDTH, h - 10);

                    const whiteWidth = CURSOR_SIZE_WIDTH * 0.65;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect((paddingBorder + cursorOffset + ((CURSOR_SIZE_WIDTH - whiteWidth) / 2)) - 1, 10 / 2, whiteWidth, h - 10);

                    ctx.restore();
                }

                let textX = self._padding + self._borderWidth, textY = Math.round(h / 2);

                text = (text === '' && self._placeHolder) ? self._placeHolder : text;

                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
                ctx.shadowColor = self._fontShadowColor;
                ctx.shadowBlur = self._fontShadowBlur;
                ctx.shadowOffsetX = self._fontShadowOffsetX;
                ctx.shadowOffsetY = self._fontShadowOffsetY;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                const normalFillStyle = (self._value !== '' && self._value !== self._placeHolder) ? self._fontColor : self._placeHolderColor;

                ctx.translate(0, textY);

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];

                    if (i >= self._selection[0] && i < self._selection[1]) {
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "#ffffff";
                        ctx.lineWidth = calculateStrokeWidth(self._fontSize);

                        ctx.strokeText(char, textX, 0);
                        ctx.fillText(char, textX, 0);
                    } else {
                        ctx.fillStyle = normalFillStyle;

                        ctx.fillText(char, textX, 0);
                    }

                    textX += self._textWidth(char);
                }
            });
        };

        let text = self._clipText();

        if (self._unfocusedState) {
            if (self._hasFocus) {
                drawFocusing();
            } else if (this._value.length > 0) {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
                ctx.shadowColor = self._fontShadowColor;
                ctx.shadowBlur = self._fontShadowBlur;
                ctx.shadowOffsetX = self._fontShadowOffsetX;
                ctx.shadowOffsetY = self._fontShadowOffsetY;
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
                ctx.lineWidth = calculateStrokeWidth(self._fontSize);

                ctx.translate(self._padding + self._borderWidth, h / 2);

                ctx.strokeText(text, 0, 0);
                ctx.fillText(text, 0, 0);
            } else {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + (self._fontSize - 1) + 'px ' + self._fontFamily;
                ctx.shadowColor = self._fontShadowColor;
                ctx.shadowBlur = self._fontShadowBlur;
                ctx.shadowOffsetX = self._fontShadowOffsetX;
                ctx.shadowOffsetY = self._fontShadowOffsetY;
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
                ctx.lineWidth = calculateStrokeWidth(self._fontSize);

                ctx.translate(self._padding + self._borderWidth, h / 2);

                ctx.strokeText(self._placeHolderUnfocused, 0, 0);
                ctx.fillText(self._placeHolderUnfocused, 0, 0);
            }
        } else {
            drawFocusing();
        }
    }

    public destroy?() {
        let self = this;

        let index = inputs.indexOf(self);
        if (index != -1) {
            inputs.splice(index, 1);
        }

        if (self._hasFocus) {
            self.blur();
        }

        document.body.removeChild(self._hiddenInput);
    }

    private _drawTextBox(fn: () => void) {
        let self = this, ctx = self._ctx, w = self.w, h = self.h, br = self._borderRadius, bw = self._borderWidth;

        if (self._backgroundImage === '') {
            ctx.fillStyle = self._backgroundColor;
            ctx.beginPath();
            ctx.roundRect(bw, bw, w - bw * 2, h - bw * 2, br - 2);
            ctx.fill();

            fn();
        } else {
            let img = new Image();
            img.src = self._backgroundImage;
            img.onload = function () {
                ctx.drawImage(img, 0, 0, img.width, img.height, bw, bw, w, h);

                fn();
            };
        }
    }

    private _clipText(value: string = undefined) {
        let self = this;
        value = (typeof value === 'undefined') ? self._value : value;

        let textWidth = self._textWidth(value),
            fillPer = textWidth / self.w,
            text = fillPer > 1 ? value.substr(-1 * Math.floor(value.length / fillPer)) : value;

        return text;
    }

    private _textWidth(text: string) {
        let self = this, ctx = self._ctx;

        ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
        ctx.textAlign = 'left';
        // Disable font kerning so multiple length doesnt have wrong precision
        ctx.fontKerning = 'none';

        return ctx.measureText(text).width;
    }

    // Override them to calc wh

    public override setW(w: number) {
        let self = this;

        self.w = w + self._padding * 2 + self._borderWidth * 2;
    }

    public override setH(h: number) {
        let self = this;

        this.h = h + self._padding * 2 + self._borderWidth * 2;
    }

    private _overInput(x: number, y: number) {
        let self = this,
            xLeft = x >= self.x + self._extraX,
            xRight = x <= self.x + self._extraX + self.w,
            yTop = y >= self.y + self._extraY,
            yBottom = y <= self.y + self._extraY + self.h;

        return xLeft && xRight && yTop && yBottom;
    }

    private _clickPos(x: number, y: number) {
        let self = this;
        let text = self._clipText();
        let totalWidth = 0;
        let pos = text.length;

        let relativeX = x - (self.x + self._padding + self._borderWidth);

        let allTextWidth = self._textWidth(text);

        if (relativeX <= 0) {
            return 0;
        }

        if (relativeX >= allTextWidth) {
            return text.length;
        }

        for (let i = 0; i < text.length; i++) {
            let charWidth = self._textWidth(text[i]);
            let nextTotalWidth = totalWidth + charWidth;

            if (relativeX <= totalWidth + (charWidth / 2)) {
                return i;
            }

            totalWidth = nextTotalWidth;
        }

        return pos;
    }

    private _mousePos(e: MouseEvent) {
        let self = this;
        const rect = self._canvas.getBoundingClientRect();
        // TODO: add the fucking interface that only for generic events, not now im fucking serious sleepy
        return {
            x: ((e.clientX - rect.left) * (self._canvas.width / rect.width)) / uiScaleFactor,
            y: ((e.clientY - rect.top) * (self._canvas.height / rect.height)) / uiScaleFactor
        };
    }
}