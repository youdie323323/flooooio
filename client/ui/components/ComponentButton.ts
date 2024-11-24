import { Canvg, presets } from "canvg";
import { calculateStrokeWidth, darkend, DARKEND_BASE } from "../../utils/common";
import { Clickable, Component, Interactive } from "./Component";
import Layout, { LayoutOptions } from "../layout/Layout";
import { scaleFactor } from "../../main";
import ExtensionEmpty from "./extensions/Extension";
import * as StackBlur from
    '../../../node_modules/stackblur-canvas/dist/stackblur-es.min.js';

export class ComponentButton extends ExtensionEmpty(Component) implements Interactive, Clickable {
    public isPressed: boolean = false;
    public isHovered: boolean = false;

    constructor(layout: LayoutOptions, protected readonly color: string, private readonly callback: () => void) {
        super(layout);
    }

    public isPointInside(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
    }

    public onMouseEnter(): void {
        this.isHovered = true;
    }

    public onMouseLeave(): void {
        this.isHovered = false;
        this.isPressed = false;
    }

    public onMouseDown(): void {
        this.isPressed = true;
    }

    public onMouseUp(): void {
        this.isPressed = false;
    }

    public onClick(): void {
        this.callback();
    }

    protected getButtonColor(): string {
        if (this.isPressed) {
            return darkend(this.color, DARKEND_BASE);
        } else if (this.isHovered) {
            return darkend(this.color, -0.1);
        }
        return this.color;
    }
}

export class ComponentTextButton extends ComponentButton {
    constructor(
        layout: LayoutOptions,
        color: string,
        callback: () => void,
        private readonly text: string
    ) {
        super(layout, color, callback);
    }

    private setFontState(ctx: CanvasRenderingContext2D): void {
        let fontSize = this.h * 0.6;
        ctx.font = `${fontSize}px Ubuntu`;

        while (ctx.measureText(this.text).width > this.w * 0.9 && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `${fontSize}px Ubuntu`;
        }

        ctx.lineWidth = calculateStrokeWidth(fontSize);
    }

    private getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.15);
    }

    private getCornerRadius(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.175);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        // Button background
        const strokeWidth = this.getStrokeWidth();
        const cornerRadius = this.getCornerRadius();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.color, DARKEND_BASE);
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
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#ffffff';

        ctx.translate(this.x + this.w / 2, this.y + this.h / 2)

        ctx.strokeText(this.text, 0, 0);
        ctx.fillText(this.text, 0, 0);
    }
}

export class ComponentSVGButton extends ComponentButton {
    private static readonly SVG_SIZE: number = 0.67;
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(
        layout: LayoutOptions,
        color: string,
        callback: () => void,
        private readonly svg: string
    ) {
        super(layout, color, callback);

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

    private getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    private getCornerRadius(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        const strokeWidth = this.getStrokeWidth();
        const cornerRadius = this.getCornerRadius();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.color, DARKEND_BASE);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // SVG rendering
        if (this.svgCanvas) {
            const drawWidth = this.w * ComponentSVGButton.SVG_SIZE;
            const drawHeight = this.h * ComponentSVGButton.SVG_SIZE;

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