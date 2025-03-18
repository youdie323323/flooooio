import type { ColorCode } from "../../../../../../../Shared/Utils/Color";
import { darkend, DARKEND_BASE } from "../../../../../../../Shared/Utils/Color";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { Components, MaybePointerLike, SetVisibleParameters, AnimationSlideDirection, SetVisibleImplementationParameters } from "../Component";
import { AnimationType, Component, renderPossibleComponents } from "../Component";

type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type SizeKeys = "w" | "h";

export type AutomaticallySizedLayoutOptions = Omit<LayoutOptions, SizeKeys>;

export type PartialSizeLayoutOptions = Optional<LayoutOptions, SizeKeys>;

export type SelectableStaticContainerLayoutOptions = AutomaticallySizedLayoutOptions | PartialSizeLayoutOptions;

export type AnyStaticContainer = AbstractStaticContainer<SelectableStaticContainerLayoutOptions>;

/**
 * Container component that can add/render childrens.
 */
export abstract class AbstractStaticContainer<T extends SelectableStaticContainerLayoutOptions> extends ExtensionBase(Component) {
    protected children: Set<Components> = new Set();
    private wasInitialized: boolean = false;
    private afterInitializedOperationQueue: Set<() => void> = new Set();

    // Disable zoom animation slide for container
    protected override animationZoomShouldSlidePosition: boolean = false;

    constructor(protected readonly layoutOptions: MaybePointerLike<T>) {
        super();

        this.once("onInitialized", () => {
            this.wasInitialized = true;

            this.afterInitializedOperationQueue.forEach(op => op());

            this.afterInitializedOperationQueue.clear();
            this.afterInitializedOperationQueue = null;
        });
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Object.values(Component.computePointerLike(this.layoutOptions)).join("") +
            Array.from(this.children).map(c => c.getCacheKey()).join("");
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();

        // Invalidate children layout cache too
        this.children.forEach(child => child.invalidateLayoutCache());
    }

    override destroy(): void {
        this.children.forEach(c => {
            // Remove instance
            this.context.removeChildrenComponent(this, c);
        });

        // Then finnally, remove the children from this
        this.children.clear();
        this.children = null;

        // To remove child completely, we need to access current context
        // But super.destory remove reference to context, so post-processing
        super.destroy();
    }

    override setVisible(...args: SetVisibleParameters[0]): void;
    override setVisible(...args: SetVisibleParameters[1]): void;
    override setVisible(...args: SetVisibleParameters[2]): void;
    override setVisible(
        ...[toggle, shouldAnimate, animationType, animationSlideDirection]: SetVisibleImplementationParameters
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
            // Dont animate it, container animation can affected to children
            c.setVisible(toggle, false);
        });
    }

    /**
     * Add chilren to this container.
     */
    public addChildren(...children: Array<Components>): this {
        children.forEach(child => this.addChild(child));

        return this;
    }

    /**
     * Add child to this container.
     */
    public addChild(child: Components): this {
        this.children.add(child);

        if (!this.wasInitialized) {
            this.afterInitializedOperationQueue.add(() => { this.context.addChildrenComponent(this, child); });
        }

        return this;
    }

    /**
     * Remove child from this container.
     */
    public removeChild(child: Components): this {
        // No need to call destroy method, can done by removeComponent
        this.children.delete(child);

        if (!this.wasInitialized) {
            this.afterInitializedOperationQueue.add(() => { this.context.removeChildrenComponent(this, child); });
        }

        return this;
    }

    /**
     * Check if the component is child of this container.
     */
    public hasChild(child: Components): boolean {
        return this.children.has(child);
    }
}

/**
 * Panel-like view static container.
 */
export class StaticPanelContainer extends AbstractStaticContainer<PartialSizeLayoutOptions> {
    constructor(
        layout: MaybePointerLike<PartialSizeLayoutOptions>,

        protected readonly color: MaybePointerLike<ColorCode>,

        protected readonly rectRadii: MaybePointerLike<number> = 1,

        protected readonly strokeWidthLimit: MaybePointerLike<number> = 5,
        protected readonly strokeWidthCoef: MaybePointerLike<number> = 0.07,
    ) {
        super(layout);
    }

    private getStrokeWidth(): number {
        return Math.min(
            Component.computePointerLike(this.strokeWidthLimit),
            Math.min(this.w, this.h) *
            Component.computePointerLike(this.strokeWidthCoef),
        );
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let maxW: number = 0, maxH: number = 0;

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const { x: childX, y: childY, w: childW, h: childH } = child.cachedLayout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        // Dont use x, y because only wanted size from origin (0, 0)
                        originX: 0,
                        originY: 0,
                    },
                );

                maxW = Math.max(maxW, childX + childW);
                maxH = Math.max(maxH, childY + childH);
            });
        }

        const strokeWidth = this.getStrokeWidth();

        const options = Object.assign(
            {
                w: maxW,
                h: maxH,
            },
            Component.computePointerLike(this.layoutOptions),
        );

        if (typeof options.w === "number") options.w += strokeWidth * 2;

        if (typeof options.h === "number") options.h += strokeWidth * 2;

        const layout = Layout.layout(options, lc);

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const childLayout = child.cachedLayout(
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

            const computedColor = Component.computePointerLike(this.color);
            const computedRadii = Component.computePointerLike(this.rectRadii);

            ctx.lineWidth = this.getStrokeWidth();
            ctx.fillStyle = computedColor;
            ctx.strokeStyle = darkend(computedColor, DARKEND_BASE);

            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, computedRadii);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }

        if (this.children.size > 0) renderPossibleComponents(ctx, this.children);
    }
}

/**
 * Horizontally arranged invisible container.
 */
export class StaticHContainer extends AbstractStaticContainer<AutomaticallySizedLayoutOptions> {
    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalWidth = 0;
        let maxHeight = 0;

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.cachedLayout(
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
                ...Component.computePointerLike(this.layoutOptions),

                w: totalWidth,
                h: maxHeight,
            },
            lc,
        );

        if (this.children.size > 0) {
            let currentX = 0;

            this.children.forEach((child) => {
                const childLayout = child.cachedLayout(
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
    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalHeight = 0;
        let maxWidth = 0;

        if (this.children.size > 0) {
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.cachedLayout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        // Dont use x, y because only wanted size from origin (0, 0)
                        originX: 0,
                        originY: 0,
                    },
                );

                totalHeight += childH;
                maxWidth = Math.max(maxWidth, childW);
            });
        }

        const layout = Layout.layout(
            {
                ...Component.computePointerLike(this.layoutOptions),
                w: maxWidth,
                h: totalHeight,
            },
            lc,
        );

        if (this.children.size > 0) {
            let currentY = 0;

            this.children.forEach((child) => {
                const childLayout = child.cachedLayout(
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

type MaybePointerLikeNumber = MaybePointerLike<number>;

/**
 * Component that just consume space.
 * 
 * @remarks
 * This is only used for containers whose coordinates are automatically determined (e.g. StaticHContainer).
 */
export class StaticSpace extends ExtensionBase(Component) {
    constructor(
        protected readonly sw: MaybePointerLikeNumber,
        protected readonly sh: MaybePointerLikeNumber,
    ) {
        super();
    }

    override layout({ originX, originY }: LayoutContext): LayoutResult {
        return {
            x: originX,
            y: originY,
            w: Component.computePointerLike(this.sw),
            h: Component.computePointerLike(this.sh),
        };
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Component.computePointerLike(this.sw) +
            Component.computePointerLike(this.sh);
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
        sw: MaybePointerLikeNumber,
        sh: MaybePointerLikeNumber,

        protected readonly sx: MaybePointerLikeNumber,
        protected readonly sy: MaybePointerLikeNumber,
    ) {
        super(sw, sh);
    }

    override layout({ originX, originY }: LayoutContext): LayoutResult {
        return {
            x: originX + Component.computePointerLike(this.sx),
            y: originY + Component.computePointerLike(this.sy),
            w: Component.computePointerLike(this.sw),
            h: Component.computePointerLike(this.sh),
        };
    }

    override getCacheKey(): string {
        return super.getCacheKey() +
            Component.computePointerLike(this.sx) +
            Component.computePointerLike(this.sy);
    }
}