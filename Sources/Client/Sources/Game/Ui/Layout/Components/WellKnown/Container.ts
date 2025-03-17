import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkend, DARKEND_BASE } from "../../../../../../../Shared/Utils/Color";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { Components, DynamicLayoutablePointer, SetVisibleParameters, AnimationSlideDirection } from "../Component";
import { AnimationType, Component, renderPossibleComponents } from "../Component";

export type AutomaticallySizableLayoutOptions = Omit<LayoutOptions, "w" | "h">;

/**
 * Addable type of container.
 * 
 * @remarks
 * Container component cant work properly if addChildrenComponent not called / not setting parentContainer,
 * so create new type that ensure container is addable, now we can determine if container is addable container.
 * __addable mark this is "Addable".
 */
export type AddableStaticContainer = (StaticPanelContainer | StaticHContainer | StaticVContainer) & { __addable: boolean };

/**
 * Container component that can add/render childrens.
 */
export abstract class AbstractStaticContainer extends ExtensionBase(Component) {
    public children: Set<Components> = new Set();

    // Disable zoom animation slide for container
    protected override animationZoomShouldSlidePosition: boolean = false;

    constructor(
        public layout: DynamicLayoutablePointer<AutomaticallySizableLayoutOptions>,
    ) {
        super();
    }

    override setVisible(...args: SetVisibleParameters[0]): void;
    override setVisible(...args: SetVisibleParameters[1]): void;
    override setVisible(...args: SetVisibleParameters[2]): void;
    override setVisible(
        toggle: boolean,
        shouldAnimate: boolean,
        animationType?: AnimationType,
        animationSlideDirection?: AnimationSlideDirection,
    ): void {
        if (shouldAnimate === true) {
            switch (animationType) {
                case AnimationType.Zoom: {
                    super.setVisible(toggle, shouldAnimate, animationType);

                    break;
                }

                case AnimationType.Slide: {
                    super.setVisible(toggle, shouldAnimate, animationType, animationSlideDirection);

                    break;
                }
            }
        } else {
            super.setVisible(toggle, shouldAnimate);
        }

        // Post-process for component-binded component

        this.children.forEach(c => {
            // Dont animate it, container animation can affected to childrens
            c.setVisible(toggle, false);
        });
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(this.computeDynamicLayoutable(this.layout)).join("") +
            Array.from(this.children).map(c => c.getCacheKey()).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();

        // Invalidate child layout cache too
        this.children.forEach(child => child.invalidateLayoutCache());
    }

    // Dont call this method! call with UserInterface.addChildrenComponent
    public addChildren(child: Components) {
        this.children.add(child);
    }

    // Dont call this method! call with UserInterface.removeChildrenComponent
    public removeChildren(child: Components) {
        // No need to call destroy method, can done by removeComponent
        this.children.delete(child);
    }

    override destroy(): void {
        super.destroy();

        this.children.forEach(c => {
            c.destroy();

            // Remove reference to this
            c.parentContainer = null;
        });

        this.children = null;
    }
}

/**
 * Components that looks like panel.
 */
export class StaticPanelContainer extends AbstractStaticContainer {
    constructor(
        layout: DynamicLayoutablePointer<AutomaticallySizableLayoutOptions>,

        private color: DynamicLayoutablePointer<ColorCode>,
    ) {
        super(layout);
    }

    private getStrokeWidth(): number {
        return Math.min(5, Math.min(this.w, this.h) * 0.07);
    }

    override calculateLayout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let maxW: number = 0, maxH: number = 0;

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const childLayout = child.cachedCalculateLayout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        // Dont use x, y because only wanted size from origin (0, 0)
                        originX: 0,
                        originY: 0,
                    },
                );

                maxW = Math.max(maxW, childLayout.x + childLayout.w);
                maxH = Math.max(maxH, childLayout.y + childLayout.h);
            });
        }

        const strokeWidth = this.getStrokeWidth();

        const layout = Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),

                w: maxW + (strokeWidth * 2),
                h: maxH + (strokeWidth * 2),
            },
            lc,
        );

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const childLayout = child.cachedCalculateLayout(
                    {
                        ctx,

                        containerWidth: layout.w - (strokeWidth * 4),
                        containerHeight: layout.h - (strokeWidth * 4),

                        originX: layout.x + strokeWidth,
                        originY: layout.y + strokeWidth,
                    },
                );

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);
            });
        }

        return layout;
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        {
            ctx.save();

            const computedColor = this.computeDynamicLayoutable(this.color);

            ctx.lineWidth = this.getStrokeWidth();
            ctx.fillStyle = computedColor;
            ctx.strokeStyle = darkend(computedColor, DARKEND_BASE);

            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, 1);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }

        if (this.children.size > 0) {
            renderPossibleComponents(ctx, this.children);
        }
    }
}

/**
 * Container component that can add/render childrens, horizontally arranged.
 */
export class StaticHContainer extends AbstractStaticContainer {
    override calculateLayout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalWidth = 0;
        let maxHeight = 0;

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.cachedCalculateLayout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        // Dont use x, y because only wanted size from origin (0, 0)
                        originX: 0,
                        originY: 0,
                    },
                );

                totalWidth += childW;
                maxHeight = Math.max(maxHeight, childH);
            });
        }

        const layout = Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),

                w: totalWidth,
                h: maxHeight,
            },
            lc,
        );

        if (this.children.size > 0) {
            let currentX = 0;

            this.children.forEach((child) => {
                const childLayout = child.cachedCalculateLayout(
                    {
                        ctx,

                        containerWidth: layout.w,
                        containerHeight: layout.h,

                        originX: layout.x + currentX,
                        originY: layout.y,
                    },
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

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        renderPossibleComponents(ctx, this.children);
    }
}

/**
 * Container component that can add/render childrens, vertically arranged.
 */
export class StaticVContainer extends AbstractStaticContainer {
    override calculateLayout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalHeight = 0;
        let maxWidth = 0;

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const childLayout = child.cachedCalculateLayout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        // Dont use x, y because only wanted size from origin (0, 0)
                        originX: 0,
                        originY: 0,
                    },
                );
                totalHeight += childLayout.h;
                maxWidth = Math.max(maxWidth, childLayout.w);
            });
        }

        const layout = Layout.layout(
            {
                ...this.computeDynamicLayoutable(this.layout),
                w: maxWidth,
                h: totalHeight,
            },
            lc,
        );

        if (this.children.size > 0) {
            let currentY = 0;

            this.children.forEach((child) => {
                const childLayout = child.cachedCalculateLayout(
                    {
                        ctx,

                        containerWidth: layout.w,
                        containerHeight: layout.h,

                        originX: layout.x,
                        originY: layout.y + currentY,
                    },
                );

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                currentY += childLayout.h;
            });
        }

        return layout;
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update();

        renderPossibleComponents(ctx, this.children);
    }
}

type DynamicLayoutableNumber = DynamicLayoutablePointer<number>;

/**
 * Component that just consume space.
 * 
 * @remarks
 * This is only used for containers whose coordinates are automatically determined (e.g. StaticHContainer).
 */
export class StaticSpace extends ExtensionBase(Component) {
    constructor(
        protected _w: DynamicLayoutableNumber,
        protected _h: DynamicLayoutableNumber,
    ) {
        super();
    }

    override calculateLayout({ originX, originY }: LayoutContext): LayoutResult {
        return {
            x: originX,
            y: originY,
            w: this.computeDynamicLayoutable(this._w),
            h: this.computeDynamicLayoutable(this._h),
        };
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            this.computeDynamicLayoutable(this._w) +
            this.computeDynamicLayoutable(this._h);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();
    }

    override render(ctx: CanvasRenderingContext2D): void { }
}

/**
 * Component that just consume space, but has coordinate.
 */
export class CoordinatedStaticSpace extends StaticSpace {
    constructor(
        _w: DynamicLayoutableNumber,
        _h: DynamicLayoutableNumber,

        private _x: DynamicLayoutableNumber,
        private _y: DynamicLayoutableNumber,
    ) {
        super(_w, _h);
    }

    override calculateLayout({ originX, originY }: LayoutContext): LayoutResult {
        return {
            x: originX + this.computeDynamicLayoutable(this._x),
            y: originY + this.computeDynamicLayoutable(this._y),
            w: this.computeDynamicLayoutable(this._w),
            h: this.computeDynamicLayoutable(this._h),
        };
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            this.computeDynamicLayoutable(this._x) +
            this.computeDynamicLayoutable(this._y);
    }
}