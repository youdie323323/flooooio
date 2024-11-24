import { scaleFactor } from "../../main";
import { LayoutOptions } from "../layout/Layout";
import { Component } from "./Component";

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
    onsubmit?: (e?: Event, self?: ComponentTextInput) => void;
    onkeydown?: (e?: KeyboardEvent, self?: ComponentTextInput) => void;
    onkeyup?: (e?: KeyboardEvent, self?: ComponentTextInput) => void;
    onfocus?: (self: ComponentTextInput) => void;
    onblur?: (self: ComponentTextInput) => void;
}

const inputs: ComponentTextInput[] = [];

export default class ComponentTextInput extends Component {
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
    private _onsubmit: (e?: Event, self?: ComponentTextInput) => void;
    private _onkeydown: (e?: KeyboardEvent, self?: ComponentTextInput) => void;
    private _onkeyup: (e?: KeyboardEvent, self?: ComponentTextInput) => void;
    private _onfocus: (self: ComponentTextInput) => void;
    private _onblur: (self: ComponentTextInput) => void;
    private _cursorGlobalAlpha: number;
    private _cursorGlobalAlphaBack: boolean;
    private _cursorPos: number;
    private _selection: [number, number];
    private _hasFocus: boolean;
    private _wasOver: boolean;
    private _backgroundColor: string | CanvasGradient;
    private _hiddenInput: HTMLInputElement;
    private _inputsIndex: number;
    private _mouseDown: boolean;
    private _selectionStart?: number;
    private _endSelection?: boolean;
    private _selectionUpdated?: boolean;
    private _cursorInterval?: NodeJS.Timeout;
    private outerW: number;
    private outerH: number;

    constructor(layout: LayoutOptions, o: CanvasInputOptions = {}) {
        super(layout);

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
        self._wasOver = false;

        self._calcWH();

        self._backgroundColor = o.backgroundColor || '#fff';

        if (self._canvas) {
            self._canvas.addEventListener('mousemove', function (e: any) {
                e = e || window.event;
                self.mousemove(e, self);
            }, false);

            self._canvas.addEventListener('mousedown', function (e: any) {
                e = e || window.event;
                self.mousedown(e, self);
            }, false);

            self._canvas.addEventListener('mouseup', function (e: any) {
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
            e = e || window.event;

            if (self._hasFocus) {
                self._hiddenInput.focus();

                self.keydown(e, self);
            }
        });

        self._hiddenInput.addEventListener('keyup', function (e: any) {
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

    canvas(data: HTMLCanvasElement = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._canvas = data;
            self._ctx = self._canvas.getContext('2d');
        } else {
            return self._canvas;
        }
    }

    extraX(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._extraX = data;
        } else {
            return self._extraX;
        }
    }

    extraY(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._extraY = data;
        } else {
            return self._extraY;
        }
    }

    fontSize(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontSize = data;
        } else {
            return self._fontSize;
        }
    }

    fontFamily(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontFamily = data;
        } else {
            return self._fontFamily;
        }
    }

    fontColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontColor = data;
        } else {
            return self._fontColor;
        }
    }

    placeHolderColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._placeHolderColor = data;
        } else {
            return self._placeHolderColor;
        }
    }

    fontWeight(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontWeight = data;
        } else {
            return self._fontWeight;
        }
    }

    fontStyle(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontStyle = data;
        } else {
            return self._fontStyle;
        }
    }

    fontShadowColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowColor = data;
        } else {
            return self._fontShadowColor;
        }
    }

    fontShadowBlur(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowBlur = data;
        } else {
            return self._fontShadowBlur;
        }
    }

    fontShadowOffsetX(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowOffsetX = data;
        } else {
            return self._fontShadowOffsetX;
        }
    }

    fontShadowOffsetY(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._fontShadowOffsetY = data;
        } else {
            return self._fontShadowOffsetY;
        }
    }

    // Override setters/getters
    set w(data: number) {
        super.w = data;

        let self = this;

        self._calcWH();
    }

    get w() {
        return super.w;
    }

    set h(data: number) {
        super.h = data;

        let self = this;

        self._calcWH();
    }

    get h() {
        return super.h;
    }

    padding(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._padding = data;
            self._calcWH();
        } else {
            return self._padding;
        }
    }

    borderWidth(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._borderWidth = data;
            self._calcWH();
        } else {
            return self._borderWidth;
        }
    }

    borderColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._borderColor = data;
        } else {
            return self._borderColor;
        }
    }

    borderRadius(data: number = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._borderRadius = data;
        } else {
            return self._borderRadius;
        }
    }

    backgroundColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._backgroundColor = data;
        } else {
            return self._backgroundColor;
        }
    }

    selectionColor(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._selectionColor = data;
        } else {
            return self._selectionColor;
        }
    }

    placeHolder(data: string = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._placeHolder = data;
        } else {
            return self._placeHolder;
        }
    }

    hasFocus(data: boolean = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._hasFocus = data;
        } else {
            return self._hasFocus;
        }
    }

    value(data: { toString(): string } = undefined) {
        let self = this;

        if (typeof data !== 'undefined') {
            self._value = data + '';
            self._hiddenInput.value = data + '';

            self._cursorPos = self._clipText().length;
        } else {
            return (self._value === self._placeHolder) ? '' : self._value;
        }
    }

    onsubmit(fn: (e?: Event, self?: ComponentTextInput) => void = undefined) {
        let self = this;

        if (typeof fn !== 'undefined') {
            self._onsubmit = fn;
        } else {
            self._onsubmit();
        }
    }

    onkeydown(fn: (e?: KeyboardEvent, self?: ComponentTextInput) => void = undefined) {
        let self = this;

        if (typeof fn !== 'undefined') {
            self._onkeydown = fn;
        } else {
            self._onkeydown();
        }
    }

    onkeyup(fn: (e?: KeyboardEvent, self?: ComponentTextInput) => void = undefined) {
        let self = this;

        if (typeof fn !== 'undefined') {
            self._onkeyup = fn;
        } else {
            self._onkeyup();
        }
    }

    focus(pos: number = undefined) {
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

    blur() {
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

    keydown(e: KeyboardEvent, self: this) {
        let keyCode = e.which;

        if (self._readonly || !self._hasFocus) {
            return;
        }

        self._onkeydown(e, self);

        if (keyCode === 65 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();

            self.selectText();
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

        self._value = self._hiddenInput.value;
        self._cursorPos = self._hiddenInput.selectionStart;
        self._selection = [0, 0];
    }

    click(e: MouseEvent | TouchEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y;

        if (self._endSelection) {
            delete self._endSelection;
            delete self._selectionUpdated;
            return;
        }

        if (self._canvas && self._overInput(x, y) || !self._canvas) {
            if (self._mouseDown) {
                self._mouseDown = false;
                self.click(e, self);
                return self.focus(self._clickPos(x, y));
            }
        } else if (!self._mouseDown) {
            return self.blur();
        }
    }

    mousemove(e: MouseEvent | TouchEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y, isOver = self._overInput(x, y);

        if (isOver && self._canvas) {
            self._canvas.style.cursor = 'text';
            self._wasOver = true;
        } else if (self._wasOver && self._canvas) {
            self._canvas.style.cursor = 'default';
            self._wasOver = false;
        }

        if (self._hasFocus && self._selectionStart >= 0) {
            let curPos = self._clickPos(x, y);

            if (!isOver) {
                if (x < self.x) {
                    curPos = 0;
                } else if (x > self.x + self.outerW) {
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

    mousedown(e: MouseEvent | TouchEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y, isOver = self._overInput(x, y);

        self._mouseDown = isOver;

        if (self._hasFocus && isOver) {
            self._selectionStart = self._clickPos(x, y);
        }
    }

    mouseup(e: MouseEvent | TouchEvent, self: this) {
        let mouse = self._mousePos(e), x = mouse.x, y = mouse.y;

        let isSelection = self._clickPos(x, y) !== self._selectionStart;
        if (self._hasFocus && self._selectionStart >= 0 && self._overInput(x, y) && isSelection) {
            self._selectionUpdated = true;
        }

        delete self._selectionStart;

        self.click(e, self);
    }

    selectText(range: [number, number] = undefined) {
        let self = this;
        range = range || [0, self._value.length];

        self._selection = [range[0], range[1]];
        self._hiddenInput.selectionStart = range[0];
        self._hiddenInput.selectionEnd = range[1];

        return self;
    }

    render() {
        let self = this, ctx = self._ctx, w = self.outerW, h = self.outerH, br = self._borderRadius;

        if (!ctx) {
            return;
        }

        ctx.save();

        ctx.translate(self.x, self.y);

        if (self._hasFocus) {
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

                let text = self._clipText();

                const paddingBorder = self._padding + self._borderWidth,
                    selectWidth = self._textWidth(text.substring(self._selection[0], self._selection[1]));

                if (selectWidth !== 0) {
                    const selectOffset = self._textWidth(text.substring(0, self._selection[0]));

                    ctx.fillStyle = self._selectionColor;

                    const heightResized = self.h * 1.7;
                    const WIDTH_OFFSET = 4;
                    ctx.fillRect(
                        paddingBorder + selectOffset - ((selectWidth === 0 ? 0 : WIDTH_OFFSET) / 2),
                        paddingBorder + ((self.h - heightResized) / 2),
                        selectWidth + WIDTH_OFFSET,
                        heightResized,
                    );
                } else {
                    ctx.save();

                    let cursorOffset = self._textWidth(text.substring(0, self._cursorPos));
                    ctx.globalAlpha = self._cursorGlobalAlpha;

                    const CURSOR_SIZE_WIDTH = 2.2;

                    ctx.fillStyle = "#000000";
                    ctx.fillRect((paddingBorder + cursorOffset) - 1, paddingBorder - (5.5 / 2), CURSOR_SIZE_WIDTH, self.h + 5.5);

                    const whiteWidth = CURSOR_SIZE_WIDTH * 0.65;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect((paddingBorder + cursorOffset + ((CURSOR_SIZE_WIDTH - whiteWidth) / 2)) - 1, paddingBorder - (5.5 / 2), whiteWidth, self.h + 5.5);

                    ctx.restore();
                }

                let textX = self._padding + self._borderWidth, textY = Math.round(paddingBorder + self.h / 2);

                text = (text === '' && self._placeHolder) ? self._placeHolder : text;

                ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
                ctx.shadowColor = self._fontShadowColor;
                ctx.shadowBlur = self._fontShadowBlur;
                ctx.shadowOffsetX = self._fontShadowOffsetX;
                ctx.shadowOffsetY = self._fontShadowOffsetY;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                const normalFillStyle = (self._value !== '' && self._value !== self._placeHolder) ? self._fontColor : self._placeHolderColor;

                let currentX = textX;
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];

                    if (i >= self._selection[0] && i < self._selection[1]) {
                        ctx.strokeStyle = '#000000';
                        ctx.fillStyle = "white";
                        ctx.lineWidth = 1.2;

                        ctx.strokeText(char, currentX, textY);
                        ctx.fillText(char, currentX, textY);
                    } else {
                        ctx.fillStyle = normalFillStyle;

                        ctx.fillText(char, currentX, textY);
                    }

                    currentX += self._textWidth(char);
                }
            });
        } else if (this._value.length > 0) {
            let textX = self._padding + self._borderWidth;

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

            ctx.strokeStyle = 'white';
            ctx.fillStyle = "#000000";
            ctx.lineWidth = 1.2;

            ctx.strokeText(this._value, textX, h / 2);
            ctx.fillText(this._value, textX, h / 2);
        } else {
            let textX = self._padding + self._borderWidth;

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

            ctx.strokeStyle = '#000000';
            ctx.fillStyle = "white";
            ctx.lineWidth = 1.2;
            ctx.strokeText(self._placeHolderUnfocused, textX, h / 2);
            ctx.fillText(self._placeHolderUnfocused, textX, h / 2);
        }

        ctx.restore();
    }

    destroy() {
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

    _drawTextBox(fn: () => void) {
        let self = this, ctx = self._ctx, w = self.outerW, h = self.outerH, br = self._borderRadius, bw = self._borderWidth;

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

    _clearSelection() {
        let self = this;

        if (self._selection[1] > 0) {
            let start = self._selection[0], end = self._selection[1];

            self._value = self._value.substr(0, start) + self._value.substr(end);
            self._cursorPos = start;
            self._cursorPos = (self._cursorPos < 0) ? 0 : self._cursorPos;
            self._selection = [0, 0];

            return true;
        }

        return false;
    }

    _clipText(value: string = undefined) {
        let self = this;
        value = (typeof value === 'undefined') ? self._value : value;

        let textWidth = self._textWidth(value), fillPer = textWidth / ((self.w + 6) - self._padding), text = fillPer > 1 ? value.substr(-1 * Math.floor(value.length / fillPer)) : value;

        return text + '';
    }

    _textWidth(text: string) {
        let self = this, ctx = self._ctx;

        ctx.font = self._fontStyle + ' ' + self._fontWeight + ' ' + self._fontSize + 'px ' + self._fontFamily;
        ctx.textAlign = 'left';
        // Disable font kerning so multiple length doesnt have wrong precision
        ctx.fontKerning = 'none';

        return ctx.measureText(text).width;
    }

    _calcWH() {
        let self = this;

        self.outerW = self.w + self._padding * 2 + self._borderWidth * 2;
        self.outerH = self.h + self._padding * 2 + self._borderWidth * 2;
    }

    _overInput(x: number, y: number) {
        let self = this,
            xLeft = x >= self.x + self._extraX,
            xRight = x <= self.x + self._extraX + self.w + self._padding * 2,
            yTop = y >= self.y + self._extraY,
            yBottom = y <= self.y + self._extraY + self.h + self._padding * 2;

        return xLeft && xRight && yTop && yBottom;
    }

    _clickPos(x: number, y: number) {
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

    _mousePos(e: MouseEvent | TouchEvent) {
        let elm: HTMLElement, x: number, y: number;

        if ("touches" in e && e.touches && e.touches.length) {
            elm = e.touches[0].target as HTMLElement;
            x = e.touches[0].pageX;
            y = e.touches[0].pageY;
        } else if ("changedTouches" in e && e.changedTouches && e.changedTouches.length) {
            elm = e.changedTouches[0].target as HTMLElement;
            x = e.changedTouches[0].pageX;
            y = e.changedTouches[0].pageY;
        } else if (!("changedTouches" in e && "touches" in e)) {
            elm = e.target as HTMLElement;
            x = e.pageX;
            y = e.pageY;
        }

        x /= scaleFactor;
        y /= scaleFactor;

        let style = document.defaultView.getComputedStyle(elm, undefined),
            paddingLeft = parseInt(style['paddingLeft'], 10) || 0,
            paddingTop = parseInt(style['paddingLeft'], 10) || 0,
            borderLeft = parseInt(style['borderLeftWidth'], 10) || 0,
            borderTop = parseInt(style['borderLeftWidth'], 10) || 0,
            htmlTop = (document.body.parentNode as HTMLElement).offsetTop || 0,
            htmlLeft = (document.body.parentNode as HTMLElement).offsetLeft || 0,
            offsetX = 0,
            offsetY = 0;

        if (typeof elm.offsetParent !== 'undefined') {
            do {
                offsetX += elm.offsetLeft;
                offsetY += elm.offsetTop;
            } while ((elm = elm.offsetParent as HTMLElement));
        }

        offsetX += paddingLeft + borderLeft + htmlLeft;
        offsetY += paddingTop + borderTop + htmlTop;

        return {
            x: x - offsetX,
            y: y - offsetY
        };
    }
}