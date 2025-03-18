import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { MaybePointerLike } from "../Component";
import { Component } from "../Component";

export default class Toggle extends ExtensionBase(Component) {
    private static readonly SCALING_DURATION: number = 50;

    private scalingProgress: number = 0;
    private scalingStartTime: number | null = null;

    private toggle: boolean = false;

    constructor(
        protected readonly layoutOptions: MaybePointerLike<LayoutOptions>,

        protected readonly onToggle: (t: boolean) => void,
    ) {
        super();

        this.on("onFocus", () => {
            this.context.canvas.style.cursor = "pointer";
        });

        this.on("onBlur", () => {
            this.context.canvas.style.cursor = "default";
        });

        this.on("onClick", () => {
            this.onToggle(!this.toggle);
        });
    }

    override layout(lc: LayoutContext): LayoutResult {
        return Layout.layout(Component.computePointerLike(this.layoutOptions), lc);
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(Component.computePointerLike(this.layoutOptions)).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    private getStrokeWidth(): number {
        return Math.max(2, Math.min(this.w, this.h) * 0.17);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        this.updateScale();

        // Button background
        const strokeWidth = this.getStrokeWidth();

        ctx.save();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = "#333333";
        ctx.fillStyle = "#666666";

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 0.05);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.restore();

        ctx.save();

        ctx.globalAlpha = this.scalingProgress;

        const rectWidth = this.w - strokeWidth;
        const rectHeight = this.h - strokeWidth;

        const rectX = this.x + (this.w - rectWidth) / 2;
        const rectY = this.y + (this.h - rectHeight) / 2;

        ctx.fillStyle = "#dddddd";

        ctx.beginPath();
        ctx.rect(rectX, rectY, rectWidth, rectHeight);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    public setToggle(toggle: boolean): this {
        this.toggle = toggle;

        this.scalingStartTime = performance.now();
        this.scalingProgress = toggle ? 0 : 1;

        return this;
    }

    private updateScale(): void {
        if (this.scalingStartTime === null) return;

        const now = performance.now();
        const elapsedTime = now - this.scalingStartTime;

        if (this.toggle) {
            this.scalingProgress = Math.min(elapsedTime / Toggle.SCALING_DURATION, 1);
        } else {
            this.scalingProgress = Math.max(1 - (elapsedTime / Toggle.SCALING_DURATION), 0);
        }

        if (this.scalingProgress >= 1 || this.scalingProgress <= 0) {
            this.scalingStartTime = null;
        }
    }
}