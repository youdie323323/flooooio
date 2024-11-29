import { ColorCode, darkend, DARKEND_BASE } from "../../utils/common";
import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import { uiScaleFactor } from "../UserInterface";
import { Component, ComponentContainer, DynamicLayoutable } from "./Component";
import ExtensionPlaceholder from "./extensions/Extension";

type DynamicLayoutableContainerLayoutOptions = DynamicLayoutable<Omit<LayoutOptions, "w" | "h">>;

/**
 * Container component that can add/render childrens.
 */
export class StaticContainer extends ExtensionPlaceholder(Component) implements ComponentContainer {
    public children: Component[] = [];

    constructor(
        public layout: DynamicLayoutableContainerLayoutOptions,
    ) {
        super();
    }

    public override render(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.globalAlpha;

        if (!this.visible && !this.isAnimating) {
            return;
        }

        if (this.isAnimating) {
            const currentTime = performance.now();
            if (this.animationStartTime === null) {
                this.animationStartTime = currentTime;
            }

            const elapsed = currentTime - this.animationStartTime;
            let progress = Math.max(0, Math.min(elapsed / this.ANIMATION_DURATION, 1));

            this.animationProgress = this.animationDirection === 'in' ? progress : 1 - progress;

            if (elapsed >= this.ANIMATION_DURATION) {
                if (this.animationDirection === 'out') {
                    this.visible = false;
                }

                this.isAnimating = false;
                this.animationStartTime = null;
            }
        }

        const easeInExpo = (x: number): number => {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        };

        const progress = easeInExpo(this.animationProgress);

        ctx.translate(this.x + this.w / 2, this.y + ((this.h / 2.2) * (1 - progress)));
        ctx.scale(progress, progress);
        ctx.translate(-(this.x + this.w / 2), -(this.y));
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

        this.layout = null;
    }

    public override setVisible(toggle: boolean, shouldAnimate: boolean = false) {
        if (shouldAnimate) {
            if (toggle === this.visible) return;

            this.isAnimating = true;
            this.animationProgress = toggle ? 0 : 1;
            this.animationStartTime = null;
            this.animationDirection = toggle ? 'in' : 'out';

            if (toggle) {
                this.visible = true;
            }
        } else {
            this.visible = toggle;
        }

        this.children.forEach(c => {
            c.setVisible(toggle, false);
        });
    }
}

/**
 * Components that looks like panel.
 */
export class StaticPanelContainer extends StaticContainer {
    constructor(
        layout: DynamicLayoutableContainerLayoutOptions,

        private color: DynamicLayoutable<ColorCode>,
    ) {
        super(layout);
    }

    public override calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        let maxW: number = 0, maxH: number = 0;
        const strokeWidth = this.getStrokeWidth();

        if (this.children) {
            this.children.forEach(c => {
                const childLayout = c.calculateLayout(width, height, 0, 0);
                maxW = Math.max(maxW, childLayout.x + childLayout.w);
                maxH = Math.max(maxH, childLayout.y + childLayout.h);
            });
        }

        const layout = Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),
                w: maxW + (strokeWidth * 2),
                h: maxH + (strokeWidth * 2),
            },
            width,
            height,
            originX,
            originY,
        );

        if (this.children) {
            this.children.forEach(c => {
                const childLayout = c.calculateLayout(
                    layout.w - (strokeWidth * 4),
                    layout.h - (strokeWidth * 4),
                    layout.x + strokeWidth,
                    layout.y + strokeWidth
                );

                c.setX(childLayout.x);
                c.setY(childLayout.y);
                c.setW(childLayout.w);
                c.setH(childLayout.h);
            });
        }

        return layout;
    }

    protected getStrokeWidth(): number {
        const minDimension = Math.min(this.w, this.h);
        return Math.max(2, minDimension * 0.02);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        const strokeWidth = this.getStrokeWidth();

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = darkend(this.computeDynamicLayoutable(this.color), DARKEND_BASE);
        ctx.fillStyle = this.computeDynamicLayoutable(this.color);

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 1);
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
}

/**
 * Container component that can add/render childrens, horizontally arranged.
 */
export class StaticHContainer extends StaticContainer {
    public override calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        let totalWidth = 0;
        let maxHeight = 0;

        if (this.children) {
            this.children.forEach(child => {
                totalWidth += child.w;
                maxHeight = Math.max(maxHeight, child.h);
            });
        }

        const layout = Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),
                w: totalWidth,
                h: maxHeight,
            },
            width,
            height,
            originX,
            originY,
        );

        if (this.children) {
            let currentX = 0;

            this.children.forEach((child) => {
                const childLayout = child.calculateLayout(
                    layout.w,
                    layout.h,
                    layout.x + currentX,
                    layout.y
                );

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                currentX += childLayout.w;
            });
        }

        return layout;
    }

    public override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        this.children.forEach(c => {
            if (c.visible) {
                ctx.save();

                c.render(ctx);

                ctx.restore();
            }
        });
    }
}

/**
 * Container component that can add/render childrens, vertically arranged.
 */
export class StaticVContainer extends StaticContainer {
    public override calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        let totalHeight = 0;
        let maxWidth = 0;

        if (this.children) {
            this.children.forEach(child => {
                totalHeight += child.h;
                maxWidth = Math.max(maxWidth, child.w);
            });
        }

        const layout = Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),
                w: maxWidth,
                h: totalHeight,
            },
            width,
            height,
            originX,
            originY,
        );

        if (this.children) {
            let currentY = 0;

            this.children.forEach((child) => {
                const childLayout = child.calculateLayout(
                    layout.w,
                    layout.h,
                    layout.x,
                    layout.y + currentY
                );

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                currentY += child.h;
            });
        }

        return layout;
    }

    public override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        this.update();

        this.children.forEach(c => {
            if (c.visible) {
                ctx.save();

                c.render(ctx);

                ctx.restore();
            }
        });
    }
}

/**
 * Component that just consume space.
 */
export class StaticSpace extends ExtensionPlaceholder(Component) {
    constructor(
        private _w: DynamicLayoutable<number>,
        private _h: DynamicLayoutable<number>,
    ) {
        super();
    }

    public calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        return {
            x: originX,
            y: originY,
            w: this.computeDynamicLayoutable(this._w),
            h: this.computeDynamicLayoutable(this._h),
        } as LayoutResult;
    }

    public render(ctx: CanvasRenderingContext2D): void { }

    public destroy?(): void {
        this._w = null;
        this._h = null;
    }
}

export class CoordinatedSpace extends ExtensionPlaceholder(Component) {
    constructor(
        private _x: DynamicLayoutable<number>,
        private _y: DynamicLayoutable<number>,
        private _w: DynamicLayoutable<number>,
        private _h: DynamicLayoutable<number>,
    ) {
        super();
    }

    public calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        return {
            x: originX + this.computeDynamicLayoutable(this._x),
            y: originY + this.computeDynamicLayoutable(this._y),
            w: this.computeDynamicLayoutable(this._w),
            h: this.computeDynamicLayoutable(this._h),
        } as LayoutResult;
    }

    public render(ctx: CanvasRenderingContext2D): void { }

    public destroy?(): void {
        this._x = null;
        this._y = null;
        this._w = null;
        this._h = null;
    }
}