import type { ColorCode } from "../../../../../../../../Shared/Utils/Color";
import { darkend, DARKEND_BASE } from "../../../../../../../../Shared/Utils/Color";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { Components, MaybePointerLike, SetVisibleOverloadParameters, SetVisibleImplementationParameters } from "../Component";
import { Component, OBSTRUCTION_AFFECTABLE, renderPossibleComponent } from "../Component";

type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export type SizeKeys = "w" | "h";

export type AutomaticallySizedLayoutOptions = Omit<LayoutOptions, SizeKeys>;

/**
 * @remarks
 * The "square size" means that w, h are same and can recive with only one parameters.
 */
export type SquareSizeLayoutOptions = AutomaticallySizedLayoutOptions;

export type PartialSizeLayoutOptions = Optional<LayoutOptions, SizeKeys>;

export type SelectableStaticContainerLayoutOptions = AutomaticallySizedLayoutOptions | PartialSizeLayoutOptions;

export type AnyStaticContainer = AbstractStaticContainer<SelectableStaticContainerLayoutOptions>;

/**
 * Container component that can add/render childrens.
 */
export abstract class AbstractStaticContainer<T extends SelectableStaticContainerLayoutOptions> extends ExtensionBase(Component) {
    protected children: Array<Components> = new Array();
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

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER) +
            CACHE_KEY_DELIMITER +
            Array.from(this.children).map(c => c.getCacheKey(lc)).join(CACHE_KEY_DELIMITER);
    }

    override invalidateLayoutCache(): void {
        this.layoutCache.invalidate();

        // Invalidate children layout cache too
        this.children.forEach(child => child.invalidateLayoutCache());
    }

    override destroy(): void {
        this.children.forEach(child => {
            // Destroy child
            child.destroy();

            // Remove instance
            this.context.removeChildComponent(child);
        });

        // Then finnally, remove the children from this
        this.children = null;

        // To remove child completely, we need to access current context
        // But super.destory remove reference to context, so post-processing
        super.destroy();
    }

    override setVisible(...args: SetVisibleOverloadParameters[0]): void;
    override setVisible(...args: SetVisibleOverloadParameters[1]): void;
    override setVisible(...args: SetVisibleOverloadParameters[2]): void;
    override setVisible(...args: SetVisibleOverloadParameters[3]): void;
    override setVisible(...args: SetVisibleOverloadParameters[4]): void;
    override setVisible(
        ...[toggle]: SetVisibleImplementationParameters
    ): void {
        // Sorry
        (super.setVisible as (...args: ReadonlyArray<any>) => {})(...arguments);

        // Post-process for component-binded component

        // TODO: do this when this container animation is done
        this.children.forEach(child => {
            // Dont animate it, container animation can affected to children
            child.setVisible(toggle, false);
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
     * Return the copy of cildren.
     */
    public getChildren(): Array<Components> {
        return this.children.slice();
    }

    /**
     * Sort the children.
     */
    public sortChildren(compareFn?: (a: Components, b: Components) => number): void {
        this.children.sort(compareFn);
    }

    /**
     * Add child to this container.
     */
    public addChild(child: Components): this {
        this.children.push(child);

        const addChildComponentOperation = () => { this.context.addChildComponent(child); };

        if (this.wasInitialized) {
            addChildComponentOperation();
        } else {
            this.afterInitializedOperationQueue.add(addChildComponentOperation);
        }

        return this;
    }

    /**
     * Remove child from this container.
     */
    public removeChild(child: Components): this {
        // No need to call destroy method, can done by removeComponent
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }

        const removeChildComponentOperation = () => { this.context.removeChildComponent(child); };

        if (this.wasInitialized) {
            removeChildComponentOperation();
        } else {
            this.afterInitializedOperationQueue.add(removeChildComponentOperation);
        }

        return this;
    }

    /**
     * Check if the component is child of this container.
     */
    public hasChild(child: Components): boolean {
        return this.children.includes(child);
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

        if (this.children.length > 0) {
            this.children.forEach(child => {
                const { x: childX, y: childY, w: childW, h: childH } = child.layout(
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

        return Layout.layout(options, lc);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update(ctx);

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

        if (this.children.length > 0) {
            const strokeWidth = this.getStrokeWidth();

            this.children.forEach(child => {
                const childLayout = child.cachedLayout({
                    ctx,

                    containerWidth: this.w - (strokeWidth * 4),
                    containerHeight: this.h - (strokeWidth * 4),

                    originX: this.x + strokeWidth,
                    originY: this.y + strokeWidth,
                });

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                renderPossibleComponent(ctx, child);
            });
        }
    }
}

/**
 * Panel-like view static container but translucent.
 */
export class StaticTranslucentPanelContainer extends AbstractStaticContainer<PartialSizeLayoutOptions> {
    constructor(
        layout: MaybePointerLike<PartialSizeLayoutOptions>,

        protected readonly containerAlpha: MaybePointerLike<number> = 1,
        protected readonly childrenAlpha: MaybePointerLike<number> = 1,

        protected readonly rectRadii: MaybePointerLike<number> = 3,
    ) {
        super(layout);
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let maxW: number = 0, maxH: number = 0;

        if (this.children.length > 0) {
            this.children.forEach(child => {
                const { x: childX, y: childY, w: childW, h: childH } = child.layout(
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

        const options = Object.assign(
            {
                w: maxW,
                h: maxH,
            },
            Component.computePointerLike(this.layoutOptions),
        );

        return Layout.layout(options, lc);
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update(ctx);

        {
            ctx.save();

            const computedContainerAlpha = Component.computePointerLike(this.containerAlpha);

            const computedRadii = Component.computePointerLike(this.rectRadii);

            ctx.globalAlpha = computedContainerAlpha;
            ctx.fillStyle = "black";

            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, computedRadii);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }

        if (this.children.length > 0) {
            ctx.save();

            ctx.globalAlpha = Component.computePointerLike(this.childrenAlpha);

            this.children.forEach(child => {
                const childLayout = child.cachedLayout({
                    ctx,

                    containerWidth: this.w,
                    containerHeight: this.h,

                    originX: this.x,
                    originY: this.y,
                });

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                renderPossibleComponent(ctx, child);
            });

            ctx.restore();
        }
    }
}

/**
 * Horizontally arranged invisible container.
 */
export class StaticHContainer extends AbstractStaticContainer<AutomaticallySizedLayoutOptions> {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        private readonly reverseChildrenRender: MaybePointerLike<boolean> = false,
        private readonly childReplaceOffset: MaybePointerLike<number | null> = null,
    ) {
        super(layoutOptions);
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalWidth = 0;
        let maxHeight = 0;

        if (this.children.length > 0) {
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.layout(
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

        return Layout.layout(
            {
                ...Component.computePointerLike(this.layoutOptions),

                w: totalWidth,
                h: maxHeight,
            },
            lc,
        );
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update(ctx);

        if (this.children.length > 0) {
            const computedReverseChildrenRender = Component.computePointerLike(this.reverseChildrenRender);

            const computedChildReplaceOffset = Component.computePointerLike(this.childReplaceOffset);

            let currentX = 0;
            if (computedReverseChildrenRender) {
                this.children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x + currentX,
                        originY: this.y,
                    });

                    currentX += (computedChildReplaceOffset ?? childLayout.w);
                });
            }

            this.children.forEach(child => {
                const childLayout = child.cachedLayout({
                    ctx,

                    containerWidth: this.w,
                    containerHeight: this.h,

                    originX: this.x + currentX,
                    originY: this.y,
                });

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                currentX +=
                    (computedReverseChildrenRender ? -1 : 1) *
                    (computedChildReplaceOffset ?? childLayout.w);

                renderPossibleComponent(ctx, child);
            });
        }
    }
}

/**
 * Vertically arranged invisible container.
 */
export class StaticVContainer extends AbstractStaticContainer<AutomaticallySizedLayoutOptions> {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        private readonly reverseChildrenRender: MaybePointerLike<boolean> = false,
        private readonly childReplaceOffset: MaybePointerLike<number | null> = null,
    ) {
        super(layoutOptions);
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalHeight = 0;
        let maxWidth = 0;

        if (this.children.length > 0) {
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.layout(
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

        return Layout.layout(
            {
                ...Component.computePointerLike(this.layoutOptions),
                w: maxWidth,
                h: totalHeight,
            },
            lc,
        );
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (!this.isRenderable) return;

        super.render(ctx);

        this.update(ctx);
        
        if (this.children.length > 0) {
            const computedReverseChildrenRender = Component.computePointerLike(this.reverseChildrenRender);

            const computedChildReplaceOffset = Component.computePointerLike(this.childReplaceOffset);

            let currentY = 0;
            if (computedReverseChildrenRender) {
                this.children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x,
                        originY: this.y + currentY,
                    });

                    currentY += (computedChildReplaceOffset ?? childLayout.h);
                });
            }

            this.children.forEach(child => {
                const childLayout = child.cachedLayout({
                    ctx,

                    containerWidth: this.w,
                    containerHeight: this.h,

                    originX: this.x,
                    originY: this.y + currentY,
                });

                child.setX(childLayout.x);
                child.setY(childLayout.y);
                child.setW(childLayout.w);
                child.setH(childLayout.h);

                currentY +=
                    (computedReverseChildrenRender ? -1 : 1) *
                    (computedChildReplaceOffset ?? childLayout.h);

                renderPossibleComponent(ctx, child);
            });
        }
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
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

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

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Component.computePointerLike(this.sw) +
            CACHE_KEY_DELIMITER +
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

    override getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Component.computePointerLike(this.sx) +
            CACHE_KEY_DELIMITER +
            Component.computePointerLike(this.sy);
    }
}