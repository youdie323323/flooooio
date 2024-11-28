import { Canvg, presets } from "canvg";
import { calculateStrokeWidth, ColorCode, darkend, DARKEND_BASE } from "../../utils/common.js";
import { Clickable, Component, Interactive } from "./Component.js";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout.js";
import ExtensionPlaceholder from "./extensions/Extension.js";
import * as StackBlur from
    'stackblur-canvas/dist/stackblur-es.min.js';

export class Button extends ExtensionPlaceholder(Component) implements Interactive, Clickable {
    public isPressed: boolean = false;
    public isHovered: boolean = false;

    public isValid: boolean = true;

    constructor(
        protected layout: LayoutOptions,
        protected readonly color: ColorCode,
        private callback: () => void,
        private invalidate?: () => boolean,
    ) {
        super();
    }

    public calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        return Layout.layout(
            this.layout,
            width,
            height,
            originX,
            originY,
        );
    }

    public onMouseEnter(): void {
        if (!this.isValid) {
            return;
        }

        this.isHovered = true;
    }

    public onMouseLeave(): void {
        if (!this.isValid) {
            return;
        }

        this.isHovered = false;
        this.isPressed = false;
    }

    public onMouseDown(): void {
        if (!this.isValid) {
            return;
        }

        this.isPressed = true;
    }

    public onMouseUp(): void {
        if (!this.isValid) {
            return;
        }

        this.isPressed = false;
    }

    public onClick(): void {
        if (!this.isValid) {
            return;
        }

        this.callback();
    }

    protected getButtonColor(): ColorCode {
        if (!this.isValid) {
            return "#aaaaa9";
        }

        if (this.isPressed) {
            return darkend(this.color, DARKEND_BASE);
        } else if (this.isHovered) {
            return darkend(this.color, -0.1);
        }
        return this.color;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        if (this?.invalidate) {
            this.isValid = this.invalidate();
            if (!this.isValid) {
                this.isHovered = false;
                this.isPressed = false;
            }
        }
    }

    public destroy?(): void { }
}

export class NormalButton extends Button {
    protected getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    protected getCornerRadius(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        // Button background
        const strokeWidth = this.getStrokeWidth();
        const cornerRadius = this.getCornerRadius();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.isValid ? this.color : this.getButtonColor(), DARKEND_BASE);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}

export class TextButton extends Button {
    constructor(
        layout: LayoutOptions,
        color: ColorCode,
        callback: () => void,
        invalidate: () => boolean,
        private readonly text: string,
        private customDraw?: (ctx: CanvasRenderingContext2D, textWidth: number) => void,
    ) {
        super(layout, color, callback, invalidate);
    }

    private setFontState(ctx: CanvasRenderingContext2D): void {
        let fontSize = this.h * 0.54;
        ctx.font = `${fontSize}px Ubuntu`;

        while (ctx.measureText(this.text).width > this.w * 0.9 && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `${fontSize}px Ubuntu`;
        }

        ctx.lineWidth = calculateStrokeWidth(fontSize);
    }

    // Override for text

    protected getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.14);
    }

    protected getCornerRadius(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        // Button background
        const strokeWidth = this.getStrokeWidth();
        const cornerRadius = this.getCornerRadius();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.isValid ? this.color : this.getButtonColor(), DARKEND_BASE);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Button text
        this.setFontState(ctx);

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textBaseline = 'middle';
        ctx.textAlign = this.customDraw ? 'left' : "center";
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#ffffff';

        const textX = this.x + (this.customDraw ? 8 : this.w / 2);
        const textY = this.y + this.h / 2;

        ctx.translate(textX, textY);

        ctx.strokeText(this.text, 0, 0);
        ctx.fillText(this.text, 0, 0);

        if (this.customDraw) {
            this.customDraw(ctx, ctx.measureText(this.text).width);
        }
    }
}

export class SVGButton extends Button {
    private static readonly SVG_SIZE: number = 0.67;
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(
        layout: LayoutOptions,
        color: ColorCode,
        callback: () => void,
        invalidate: () => boolean,
        private readonly svg: string,
    ) {
        super(layout, color, callback, invalidate);

        (async () => {
            const canvas = new OffscreenCanvas(512, 512);
            const ctx = canvas.getContext("2d", {
                antialias: true,
                alpha: true
            });

            if (ctx) {
                await Canvg.fromString(ctx, this.svg, presets.offscreen()).render();
                // Use stackblur to relief jaggy
                StackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 8);

                this.svgCanvas = canvas;
            }
        })();
    }

    protected getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    protected getCornerRadius(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        const strokeWidth = this.getStrokeWidth();
        const cornerRadius = this.getCornerRadius();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.isValid ? this.color : this.getButtonColor(), DARKEND_BASE);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // SVG rendering
        if (this.svgCanvas) {
            const drawWidth = this.w * SVGButton.SVG_SIZE;
            const drawHeight = this.h * SVGButton.SVG_SIZE;

            ctx.drawImage(
                this.svgCanvas,
                this.x + (this.w - drawWidth) / 2,
                this.y + (this.h - drawHeight) / 2,
                drawWidth,
                drawHeight
            );
        }
    }
}