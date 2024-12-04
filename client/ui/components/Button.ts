import { Canvg, presets } from "canvg";
import { ColorCode, darkend, DARKEND_BASE } from "../../utils/common.js";
import { Clickable, Component, MaybeDynamicLayoutablePointer, Interactive, ComponentSymbol, ADDED, AllComponents } from "./Component.js";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout.js";
import ExtensionPlaceholder from "./extensions/Extension.js";
import * as StackBlur from
    'stackblur-canvas/dist/stackblur-es.min.js';
import { AddableContainer, StaticTransparentPanelContainer } from "./Container.js";
import { calculateStrokeWidth } from "./Text.js";

// TODO: change style of cursor while focusing/bluring, also toggle too

export class Button extends ExtensionPlaceholder(Component) implements Interactive, Clickable {
    private isPressed: boolean = false;
    private isHovered: boolean = false;

    private isValid: boolean = true;

    constructor(
        protected layout: LayoutOptions,
        
        private color: MaybeDynamicLayoutablePointer<ColorCode>,
        private callback: () => void,
        private validate: MaybeDynamicLayoutablePointer<boolean>,
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

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        // Update per rAF frame

        this.isValid = !!this.computeDynamicLayoutable(this.validate);
        if (!this.isValid) {
            this.isHovered = false;
            this.isPressed = false;
        }
    }

    public override getCacheKey(): string {
        return super.getCacheKey() + `${Object.values(this.computeDynamicLayoutable(this.layout)).join("")}`
    }

    public invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    public destroy(): void {
        super.destroy();
     }

    public onFocus(): void {
        if (!this.isValid) {
            return;
        }

        this.canvas.style.cursor = "pointer";

        this.isHovered = true;
    }

    public onBlur(): void {
        if (!this.isValid) {
            return;
        }

        this.canvas.style.cursor = "default";

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

        const computedColor = this.computeDynamicLayoutable(this.color);

        if (this.isPressed) {
            return darkend(computedColor, 0.1);
        } else if (this.isHovered) {
            return darkend(computedColor, -0.1);
        }
        return computedColor;
    }

    protected getButtonColorStroke(): ColorCode {
        if (!this.isValid) {
            return darkend("#aaaaa9", DARKEND_BASE);
        }

        return darkend(this.computeDynamicLayoutable(this.color), DARKEND_BASE);
    }
}

export class TextButton extends Button {
    constructor(
        layout: LayoutOptions,
        color: ColorCode,
        callback: () => void,
        validate: MaybeDynamicLayoutablePointer<boolean>,

        private readonly text: string,
        private customDraw?: (ctx: CanvasRenderingContext2D, textWidth: number) => void,
    ) {
        super(layout, color, callback, validate);
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

        const color = this.getButtonColor();
        const strokeColor = this.getButtonColorStroke();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = color;

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
    private static readonly SVG_SIZE: number = 0.7;
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(
        layout: LayoutOptions,
        color: ColorCode,
        callback: () => void,
        validate: MaybeDynamicLayoutablePointer<boolean>,

        private readonly svg: string,
    ) {
        super(layout, color, callback, validate);

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

        const color = this.getButtonColor();
        const strokeColor = this.getButtonColorStroke();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = color;

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