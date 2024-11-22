import { Canvg, presets } from "canvg";
import { darkend, DARKEND_BASE } from "../../utils/common";
import { Clickable, Component, Interactive } from "./Component";
import Layout, { LayoutOptions } from "../layout/Layout";
import { scaleFactor } from "../../main";

export class ComponentButton implements Component, Interactive, Clickable {
    visible: boolean = true;
    opacity: number = 1;

    x: number;
    y: number;
    w: number;
    h: number;

    public isPressed: boolean = false;
    public isHovered: boolean = false;
    public enabled: boolean = true;

    constructor(protected layout: LayoutOptions, protected readonly color: string, private readonly callback: () => void) {
        this.updateAbsolutePosition(window.innerWidth / scaleFactor, window.innerHeight / scaleFactor);
    }

    public updateAbsolutePosition(viewportWidth: number, viewportHeight: number): void {
        const { x, y, width, height } = Layout.calculatePosition(
            this.layout,
            viewportWidth,
            viewportHeight
        );

        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
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
        if (this.enabled) {
            this.isPressed = true;
        }
    }

    public onMouseUp(): void {
        this.isPressed = false;
    }

    public onClick(): void {
        if (this.enabled) {
            this.callback();
        }
    }

    protected getButtonColor(): string {
        if (!this.enabled) {
            return darkend(this.color, 0.5);
        }
        if (this.isPressed) {
            return darkend(this.color, DARKEND_BASE);
        } else if (this.isHovered) {
            return darkend(this.color, -0.1);
        }
        return this.color;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.opacity;
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

    private setFontSize(ctx: CanvasRenderingContext2D): void {
        let fontSize = this.h * 0.6;
        ctx.font = `${fontSize}px Ubuntu, sans-serif`;

        while (ctx.measureText(this.text).width > this.w * 0.9 && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `${fontSize}px Ubuntu, sans-serif`;
        }

        ctx.lineWidth = Math.max(1, fontSize * 0.125);
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
        ctx.save();

        super.render(ctx);

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
        this.setFontSize(ctx);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;

        const textColor = this.enabled ? 'white' : '#666666';

        ctx.strokeStyle = this.enabled ? '#000000' : '#444444';
        ctx.strokeText(this.text, centerX, centerY);
        ctx.fillStyle = textColor;
        ctx.fillText(this.text, centerX, centerY);

        ctx.restore();
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
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                await Canvg.fromString(ctx, this.svg, presets.offscreen()).render();
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
        ctx.save();

        super.render(ctx);

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
            const size = ComponentSVGButton.SVG_SIZE;
            const drawWidth = this.w * size;
            const drawHeight = this.h * size;
            const drawX = this.x + (this.w - drawWidth) / 2;
            const drawY = this.y + (this.h - drawHeight) / 2;

            ctx.drawImage(
                this.svgCanvas,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );
        }

        ctx.restore();
    }
}