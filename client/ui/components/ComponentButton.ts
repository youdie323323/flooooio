import { Canvg, presets } from "canvg";
import { darkend, DARKEND_BASE } from "../../utils/common";
import { Clickable, Component, Interactive } from "./Component";
import Layout, { LayoutOptions } from "../layout/Layout";

export class ComponentButton implements Component, Interactive, Clickable {
    protected x: number;
    protected y: number;
    protected w: number;
    protected h: number;
    protected scale: number = 1;

    private _callback: () => void;

    public isPressed: boolean = false;
    public isHovered: boolean = false;
    public visible: boolean = true;
    public enabled: boolean = true;

    constructor(protected layout: LayoutOptions, protected readonly color: string, callback: () => void) {
        this._callback = callback;
        this.updateAbsolutePosition(window.innerWidth, window.innerHeight);
    }

    public updateAbsolutePosition(viewportWidth: number, viewportHeight: number): void {
        const { x, y, width, height, scale } = Layout.calculatePosition(
            this.layout,
            viewportWidth,
            viewportHeight
        );

        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.scale = scale;
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
            this._callback();
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
        ctx.scale(this.scale, this.scale);
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
        let fontSize = (this.h / this.scale) * 0.5;
        ctx.font = `${fontSize}px Ubuntu, sans-serif`;

        while (ctx.measureText(this.text).width > (this.w / this.scale) * 0.9 && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `${fontSize}px Ubuntu, sans-serif`;
        }

        ctx.lineWidth = Math.max(1, fontSize * 0.2);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        super.render(ctx);

        const scaledX = this.x / this.scale;
        const scaledY = this.y / this.scale;
        const scaledW = this.w / this.scale;
        const scaledH = this.h / this.scale;

        // Button background
        ctx.lineWidth = 2.75;
        ctx.strokeStyle = darkend(this.color, DARKEND_BASE);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(scaledX, scaledY, scaledW, scaledH, 3);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Button text
        this.setFontSize(ctx);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const centerX = scaledX + scaledW / 2;
        const centerY = scaledY + scaledH / 2;

        const textColor = this.enabled ? 'white' : '#666666';

        ctx.strokeStyle = this.enabled ? '#000000' : '#444444';
        ctx.strokeText(this.text, centerX, centerY);
        ctx.fillStyle = textColor;
        ctx.fillText(this.text, centerX, centerY);

        ctx.restore();
    }
}

export class ComponentSVGButton extends ComponentButton {
    private static readonly SVG_SIZE: number = 0.65;
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(
        layout: LayoutOptions,
        color: string,
        callback: () => void,
        private readonly svg: string
    ) {
        super(layout, color, callback);

        this.initSVG();
    }

    private async initSVG(): Promise<void> {
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
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        super.render(ctx);

        const scaledX = this.x / this.scale;
        const scaledY = this.y / this.scale;
        const scaledW = this.w / this.scale;
        const scaledH = this.h / this.scale;

        ctx.lineWidth = 2.75;
        ctx.strokeStyle = darkend(this.color, DARKEND_BASE);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(scaledX, scaledY, scaledW, scaledH, 3);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // SVG rendering
        if (this.svgCanvas) {
            const size = ComponentSVGButton.SVG_SIZE;
            const drawWidth = scaledW * size;
            const drawHeight = scaledH * size;
            const drawX = scaledX + (scaledW - drawWidth) / 2;
            const drawY = scaledY + (scaledH - drawHeight) / 2;

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