import { darkend, DARKEND_BASE } from "../../common/common";
import Layout, { LayoutOptions } from "../layout/Layout";
import { Container, Interactive, Component } from "./Component";

export class ComponentContainer implements Container, Interactive {
    public children: Component[] = [];
    public visible: boolean = true;
    public enabled: boolean = true;

    protected x: number;
    protected y: number;
    protected w: number;
    protected h: number;

    constructor(
        protected layout: LayoutOptions,
        protected readonly color: string
    ) {
        this.updateAbsolutePosition(window.innerWidth, window.innerHeight);
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

        // Update all children positions
        this.children.forEach(child => {
            child.updateAbsolutePosition(width, height);
        });
    }

    public addChild(component: Component): void {
        this.children.push(component);
    }

    public removeChild(component: Component): void {
        const index = this.children.indexOf(component);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }

    public isPointInside(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.lineWidth = 10;
        ctx.strokeStyle = darkend(this.color, DARKEND_BASE);
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 1);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.restore();

        for (const child of this.children) {
            if (child.visible) {
                child.render(ctx);
            }
        }
    }
}