import { Canvg, presets } from "canvg";
import { darkend, darkendBase } from "../../common/common";
import { Component } from "./Component";

export interface RelativePosition {
    xPercent: number;
    yPercent: number;
    widthPercent?: number; 
    heightPercent?: number;
    aspectRatio?: number;  
}

export abstract class ComponentsButton implements Component {
    protected relativePos: RelativePosition;
    protected x: number;
    protected y: number;
    protected w: number;
    protected h: number;
    protected color: string;
    private _callback: () => void;
    public isPressed: boolean = false;
    public isHovered: boolean = false;

    constructor(relativePos: RelativePosition, color: string, callback: () => void) {
        this.relativePos = {
            ...relativePos,
            aspectRatio: relativePos.aspectRatio || 1.0
        };
        this.color = color;
        this._callback = callback;
        this.updateAbsolutePosition(window.innerWidth, window.innerHeight);
    }

    public updateAbsolutePosition(viewportWidth: number, viewportHeight: number): void {
        const baseSize = Math.min(viewportWidth, viewportHeight);
        
        if (this.relativePos.widthPercent !== undefined) {
            this.w = baseSize * this.relativePos.widthPercent;
            this.h = this.w / this.relativePos.aspectRatio!;
        } else if (this.relativePos.heightPercent !== undefined) {
            this.h = baseSize * this.relativePos.heightPercent;
            this.w = this.h * this.relativePos.aspectRatio!;
        } else {
            this.w = baseSize * 0.1;
            this.h = this.w / this.relativePos.aspectRatio!;
        }

        this.x = this.relativePos.xPercent * viewportWidth;
        this.y = this.relativePos.yPercent * viewportHeight;
    }

    public isPointInside(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
    }

    public setPressed(pressed: boolean): void {
        this.isPressed = pressed;
    }

    public setHovered(hovered: boolean): void {
        this.isHovered = hovered;
    }

    public executeCallback(): void {
        this._callback();
    }

    protected getButtonColor(): string {
        if (this.isPressed) {
            return darkend(this.color, darkendBase);
        } else if (this.isHovered) {
            return darkend(this.color, -0.1);
        }
        return this.color;
    }

    public abstract render(ctx: CanvasRenderingContext2D): void;
}

export class ComponentsTextButton extends ComponentsButton {
    private text: string;

    constructor(relativePos: RelativePosition, color: string, callback: () => void, text: string) {
        super(relativePos, color, callback);
        this.text = text;
    }

    private calculateFontSize(ctx: CanvasRenderingContext2D): number {
        let fontSize = this.h * 0.6;
        ctx.font = `${fontSize}px Ubuntu, sans-serif`;

        while (ctx.measureText(this.text).width > this.w * 0.9 && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `${fontSize}px Ubuntu, sans-serif`;
        }

        return fontSize;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Button background
        ctx.lineWidth = 7;
        ctx.strokeStyle = darkend(this.color, darkendBase);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 5);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Button text
        const fontSize = this.calculateFontSize(ctx);
        ctx.font = `${fontSize}px Ubuntu, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = 6;

        const centerX = this.x + this.w / 2;
        const centerY = this.y + this.h / 2;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(this.text, centerX, centerY);
        ctx.fillStyle = "white";
        ctx.fillText(this.text, centerX, centerY);

        ctx.restore();
    }
}

export class ComponentsSVGButton extends ComponentsButton {
    private static readonly SVG_SIZE: number = 0.65;
    private svg: string;
    private svgCanvas: OffscreenCanvas | null = null;

    constructor(relativePos: RelativePosition, color: string, callback: () => void, svg: string) {
        super(relativePos, color, callback);
        this.svg = svg;
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

        // Button background
        ctx.lineWidth = 7;
        ctx.strokeStyle = darkend(this.color, darkendBase);
        ctx.fillStyle = this.getButtonColor();

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 5);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // SVG
        if (this.svgCanvas) {
            ctx.drawImage(this.svgCanvas,
                this.x + (this.w - this.w * ComponentsSVGButton.SVG_SIZE) / 2,
                this.y + (this.h - this.h * ComponentsSVGButton.SVG_SIZE) / 2,
                this.w * ComponentsSVGButton.SVG_SIZE,
                this.h * ComponentsSVGButton.SVG_SIZE
            );
        }

        ctx.restore();
    }
}