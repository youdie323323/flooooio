import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkend, DARKEND_BASE } from "../../../../../../../Shared/Utils/Color";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { Components, DynamicLayoutablePointer, SetVisibleParameters, AnimationSlideDirection } from "../Component";
import { AnimationType, Component, renderPossibleComponents } from "../Component";

type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type SizeKeys = "w" | "h";

export type AutomaticallySizedLayoutOptions = Omit<LayoutOptions, SizeKeys>;

export type UnRequiredSizeLayoutOptions = Optional<LayoutOptions, SizeKeys>;

export type PartialSizeLayoutOptions = AutomaticallySizedLayoutOptions | UnRequiredSizeLayoutOptions;

export type AnyStaticContainer = AbstractStaticContainer<PartialSizeLayoutOptions>;

/**
 * Addable type of container.
 * 
 * @remarks
 * Container component cant work properly if addChildrenComponent not called / not setting parentContainer,
 * so create new type that ensure container is addable, now we can determine if container is addable container.
 * __addable mark this is "Addable".
 */
export type AnyAddableStaticContainer = AnyStaticContainer & { __addable: boolean };

/**
 * Container component that can add/render childrens.
 */
export abstract class AbstractStaticContainer<T extends PartialSizeLayoutOptions>
    extends ExtensionBase(Component) {
    protected children: Set<Components> = new Set();

    // Disable zoom animation slide for container
    protected override animationZoomShouldSlidePosition: boolean = false;

    constructor(protected layout: DynamicLayoutablePointer<T>) {
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
        this.children.forEach(c => {
            // Remove reference to this
            c.parentContainer = null;

            // Then, remove completely instance
            this.context.removeChildrenComponent(this, c);
        });

        // Then finnally, remove the child from this
        this.children.clear();
        this.children = null;

        // To remove child completely, we need to access current context
        // But super.destory remove reference to context, so post-processing
        super.destroy();
    }
}

/**
 * Panel-like view static container.
 */
export class StaticPanelContainer extends AbstractStaticContainer<UnRequiredSizeLayoutOptions> {
    constructor(
        layout: DynamicLayoutablePointer<UnRequiredSizeLayoutOptions>,

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

        const computedLayout = this.computeDynamicLayoutable(this.layout);

        if (typeof computedLayout.w === "number") computedLayout.w += strokeWidth * 2;

        if (typeof computedLayout.h === "number") computedLayout.h += strokeWidth * 2;

        const layout = Layout.layout(
            Object.assign(
                {
                    w: maxW + (strokeWidth * 2),
                    h: maxH + (strokeWidth * 2),
                },
                computedLayout,
            ),
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
 * Horizontally arranged invisible container.
 */
export class StaticHContainer extends AbstractStaticContainer<AutomaticallySizedLayoutOptions> {
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
 * Vertically arranged invisible container.
 */
export class StaticVContainer extends AbstractStaticContainer<AutomaticallySizedLayoutOptions> {
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
        protected sw: DynamicLayoutableNumber,
        protected sh: DynamicLayoutableNumber,
    ) {
        super();
    }

    override calculateLayout({ originX, originY }: LayoutContext): LayoutResult {
        return {
            x: originX,
            y: originY,
            w: this.computeDynamicLayoutable(this.sw),
            h: this.computeDynamicLayoutable(this.sh),
        };
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            this.computeDynamicLayoutable(this.sw) +
            this.computeDynamicLayoutable(this.sh);
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
        sw: DynamicLayoutableNumber,
        sh: DynamicLayoutableNumber,

        private sx: DynamicLayoutableNumber,
        private sy: DynamicLayoutableNumber,
    ) {
        super(sw, sh);
    }

    override calculateLayout({ originX, originY }: LayoutContext): LayoutResult {
        return {
            x: originX + this.computeDynamicLayoutable(this.sx),
            y: originY + this.computeDynamicLayoutable(this.sy),
            w: this.computeDynamicLayoutable(this.sw),
            h: this.computeDynamicLayoutable(this.sh),
        };
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            this.computeDynamicLayoutable(this.sx) +
            this.computeDynamicLayoutable(this.sy);
    }
}