import { ColorCode, darkend, DARKEND_BASE } from "../../utils/common";
import Layout, { LayoutOptions } from "../layout/Layout";
import { uiScaleFactor } from "../UserInterface";
import { Component, Container } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

/**
 * Container component that can add/render childrens.
 */
export default class ComponentContainer extends ExtensionPlaceholder(Component) implements Container {
    children: Component[];

    constructor(
        layout: LayoutOptions,
        private readonly color: ColorCode,
    ) {
        super(layout);

        this.children = [];
    }

    public override calculateLayout(
        viewportWidth: number,
        viewportHeight: number,
        originX: number = 0,
        originY: number = 0
    ): void {
        const { x, y, w, h } = Layout.calculatePosition(
            this.layout,
            viewportWidth,
            viewportHeight,
            originX,
            originY,
        );

        this.setX(x);
        this.setY(y);
        this.setW(w);
        this.setH(h);

        if (this.children) {
            const scaledWidth = this.w / uiScaleFactor;
            const scaledHeight = this.h / uiScaleFactor;

            this.children.forEach(c => {
                c.calculateLayout(scaledWidth, scaledHeight, this.x, this.y);
            });
        }
    }

    private getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.07);
    }

    private getCornerRadius(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.01);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        const strokeWidth = this.getStrokeWidth();
        const cornerRadius = this.getCornerRadius();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.color, DARKEND_BASE);
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, cornerRadius);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        this.children.forEach(c => {
            if (c.visible) {
                ctx.save();

                c.render(ctx);

                ctx.restore();
            }
        });
    }

    // Dont call this method! call with UserInterface.addChildrenComponent
    public addChildren(child: Component) {
        this.children.push(child);
    }

    // Dont call this method! call with UserInterface.removeChildrenComponent
    public removeChildren(child: Component) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    public destroy?(): void {
        this.children.forEach(c => {
            c.destroy();
        });

        this.children = [];

        this.children = null;
    }
}