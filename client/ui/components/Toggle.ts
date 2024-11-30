import { ColorCode, darkend, DARKEND_BASE } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { Component, Interactive, Clickable, MaybeDynamicLayoutablePointer } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

export default class Toggle extends ExtensionPlaceholder(Component) implements Interactive, Clickable {
    private static readonly SCALING_DURATION: number = 100;
    private scalingProgress: number = 0;
    private scalingStartTime: number | null = null;
    
    private toggle: boolean = false;

    constructor(
        protected layout: MaybeDynamicLayoutablePointer<LayoutOptions>,
        
        private readonly onToggle: (t: boolean) => void,
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
            this.computeDynamicLayoutable(this.layout),
            width,
            height,
            originX,
            originY,
        );
    }

    public override getCacheKey(): string {
        return super.getCacheKey() + `${Object.values(this.computeDynamicLayoutable(this.layout))}`
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        this.scaling();

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

        const rectWidth = (this.w - strokeWidth) * this.scalingProgress;
        const rectHeight = (this.h - strokeWidth) * this.scalingProgress;

        const rectX = this.x + (this.w - rectWidth) / 2;
        const rectY = this.y + (this.h - rectHeight) / 2;

        ctx.fillStyle = "#dddddd";

        ctx.beginPath();
        ctx.rect(rectX, rectY, rectWidth, rectHeight);
        ctx.fill();
        ctx.closePath();
    }

    public destroy?(): void { }
    
    public onMouseEnter(): void {
    }

    public onMouseLeave(): void {
    }

    public onClick(): void {
        this.onToggle(!this.toggle);
    }

    protected getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.14);
    }

    public startScaling(toggle: boolean): void {
        this.toggle = toggle;

        this.scalingStartTime = performance.now();
        this.scalingProgress = toggle ? 0 : 1;
    }

    private scaling(): void {
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