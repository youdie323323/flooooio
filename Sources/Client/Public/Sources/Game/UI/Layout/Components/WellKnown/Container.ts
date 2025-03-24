import type { ColorCode } from "../../../../../../../../Shared/Utils/Color";
import { darkened, DARKENED_BASE } from "../../../../../../../../Shared/Utils/Color";
import ExtensionBase from "../../Extensions/Extension";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { Components, MaybePointerLike, AnimationConfigOf, AnimationType, ComponentOpener, ComponentCloser, FakeSetVisibleToggleType, FakeSetVisibleObserverType } from "../Component";
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

export type AnyStaticContainer = AbstractStaticContainer<SelectableStaticContainerLayoutOptions, Components>;

/**
 * Container component that can add/render childrens.
 */
export abstract class AbstractStaticContainer<T extends SelectableStaticContainerLayoutOptions, Child extends Components>
    extends ExtensionBase(Component) {
    protected children: Array<Child> = new Array();
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

    override setVisible(
        toggle: false,
        closer: ComponentCloser,
        shouldAnimate: false,
    ): void;
    override setVisible<T extends AnimationType>(
        toggle: false,
        closer: ComponentCloser,
        shouldAnimate: true,
        animationType: T,
        animationConfig?: AnimationConfigOf<T>,
    ): void;
    override setVisible(
        toggle: true,
        opener: ComponentOpener,
        shouldAnimate: false,
    ): void;
    override setVisible<T extends AnimationType>(
        toggle: true,
        opener: ComponentOpener,
        shouldAnimate: true,
        animationType: T,
        animationConfig?: AnimationConfigOf<T>,
    ): void;
    override setVisible<T extends AnimationType>(
        toggle: boolean,
        openerOrCloser: ComponentOpener | ComponentCloser,
        shouldAnimate: boolean,
        animationType?: T,
        animationConfig: AnimationConfigOf<T> = {},
    ): void {
        // Sorry
        (super.setVisible as (...args: ReadonlyArray<any>) => {})(...arguments);

        // Post-process for component-binded component

        const setChildrenVisible = () => {
            this.children.forEach(child => {
                // Dont animate it, container animation can affected to children
                child.setVisible(<FakeSetVisibleToggleType>toggle, <FakeSetVisibleObserverType>openerOrCloser, false);
            });
        };

        if (!toggle && shouldAnimate) {
            this.once("onOutAnimationEnd", setChildrenVisible);
        } else {
            setChildrenVisible();
        }
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

    /**
     * Add chilren to this container.
     */
    public addChildren(...children: Array<Child>): this {
        children.forEach(child => this.addChild(child));

        return this;
    }

    /**
     * Return the copy of cildren.
     */
    public getChildren(): Array<Child> {
        return this.children.slice();
    }

    /**
     * Sort the children.
     */
    public sortChildren(compareFn?: (a: Child, b: Child) => number): void {
        this.children.sort(compareFn);
    }

    /**
     * Add child to this container.
     */
    public addChild(child: Child): this {
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
    public removeChild(child: Child): this {
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
    public hasChild(child: Child): boolean {
        return this.children.includes(child);
    }
}

/**
 * Panel-like view static container.
 */
export class StaticPanelContainer<Child extends Components = Components> extends AbstractStaticContainer<PartialSizeLayoutOptions, Child> {
    constructor(
        layout: MaybePointerLike<PartialSizeLayoutOptions>,

        dismissIfClickedOutside: boolean = false,

        protected readonly color: MaybePointerLike<ColorCode> = "#ffffff",

        protected readonly rectRadii: MaybePointerLike<number> = 1,

        protected readonly strokeWidthLimit: MaybePointerLike<number> = 5,
        protected readonly strokeWidthCoef: MaybePointerLike<number> = 0.07,
    ) {
        super(layout);

        if (dismissIfClickedOutside) {
            this.on("onClickOutside", () => { this.desiredVisible && this.revertAnimation(<ComponentCloser><unknown>(this)); });
        }
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
        super.render(ctx);

        { // Draw the background panel
            ctx.save();

            const computedColor = Component.computePointerLike(this.color);
            const computedRadii = Component.computePointerLike(this.rectRadii);

            ctx.lineWidth = this.getStrokeWidth();
            ctx.fillStyle = computedColor;
            ctx.strokeStyle = darkened(computedColor, DARKENED_BASE);

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
                const childLayout = child.layout({
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
export class StaticTranslucentPanelContainer<Child extends Components = Components> extends AbstractStaticContainer<PartialSizeLayoutOptions, Child> {
    constructor(
        layout: MaybePointerLike<PartialSizeLayoutOptions>,

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

        return Layout.layout(
            Object.assign(
                {
                    w: maxW,
                    h: maxH,
                },
                Component.computePointerLike(this.layoutOptions),
            ),
            lc,
        );
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        {
            ctx.save();

            const computedRadii = Component.computePointerLike(this.rectRadii);

            // 0.5 if globalAlpha is 1
            ctx.globalAlpha = ctx.globalAlpha / 2;
            ctx.fillStyle = "black";

            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, computedRadii);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }

        if (this.children.length > 0) {
            ctx.save();

            this.children.forEach(child => {
                const childLayout = child.layout({
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

export abstract class AbstractStaticChildLerpableContainer<Child extends Components> extends AbstractStaticContainer<AutomaticallySizedLayoutOptions, Child> {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    protected static readonly POSITION_LERP_FACTOR = 0.1;

    protected childPositions: Map<Child, number> = new Map();

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        protected readonly lerpChildren: MaybePointerLike<boolean> = false,
    ) {
        super(layoutOptions);
    }

    override destroy(): void {
        this.childPositions.clear();
        this.childPositions = null;

        super.destroy();
    }
}

/**
 * Horizontally arranged invisible container.
 */
export class StaticHContainer<Child extends Components = Components> extends AbstractStaticChildLerpableContainer<Child> {
    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        lerpChildren: MaybePointerLike<boolean> = false,

        private readonly centerChildren: MaybePointerLike<boolean> = false,
        private readonly childrenSpacingOverride: MaybePointerLike<number | null> = null,
        private readonly reverseChildrenRender: MaybePointerLike<boolean> = false,
    ) {
        super(
            layoutOptions,

            lerpChildren,
        );
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalWidth = 0;
        let maxHeight = 0;

        const computedChildrenSpacingOverride = Component.computePointerLike(this.childrenSpacingOverride);
        const computedReverseChildrenRender = Component.computePointerLike(this.reverseChildrenRender);

        if (this.children.length > 0) {
            let currentX = 0;

            if (computedReverseChildrenRender && computedChildrenSpacingOverride) {
                currentX = computedChildrenSpacingOverride * (this.children.length - 1);
            }

            this.children.forEach(child => {
                const { w: childW, h: childH } = child.layout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        originX: currentX,
                        originY: 0,
                    },
                );

                maxHeight = Math.max(maxHeight, childH);

                if (computedChildrenSpacingOverride !== null) {
                    totalWidth = Math.max(totalWidth, currentX + childW);
                    currentX += (computedReverseChildrenRender ? -1 : 1) * computedChildrenSpacingOverride;
                } else {
                    totalWidth = Math.max(totalWidth, currentX + childW);
                    currentX += (computedReverseChildrenRender ? -1 : 1) * childW;
                }
            });

            if (computedReverseChildrenRender) {
                if (computedChildrenSpacingOverride === null) {
                    totalWidth = currentX * -1;
                }
            }
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
        super.render(ctx);

        if (this.children.length > 0) {
            const computedLerpChildren = Component.computePointerLike(this.lerpChildren);

            const computedCenterChildren = Component.computePointerLike(this.centerChildren);
            const computedSpacingOverride = Component.computePointerLike(this.childrenSpacingOverride);
            const computedReverseChildrenRender = Component.computePointerLike(this.reverseChildrenRender);

            let currentX = 0;
            if (computedReverseChildrenRender) {
                if (computedSpacingOverride !== null) {
                    currentX += computedSpacingOverride * (this.children.length - 1);
                } else {
                    this.children.forEach(child => {
                        const childLayout = child.layout({
                            ctx,

                            containerWidth: this.w,
                            containerHeight: this.h,

                            originX: this.x + currentX,
                            originY: this.y,
                        });

                        currentX += childLayout.w;
                    });

                    currentX -= (
                        this.children[0]?.layout({
                            ctx,

                            containerWidth: this.w,
                            containerHeight: this.h,

                            originX: this.x,
                            originY: this.y,
                        }).w ?? 0
                    );
                }
            }

            if (computedLerpChildren) {
                this.children.forEach(child => {
                    const childLayout = child.layout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x + currentX,
                        originY: this.y,
                    });

                    const targetX = childLayout.x;
                    const targetY =
                        computedCenterChildren
                            ? this.y + (this.h - childLayout.h) / 2
                            : childLayout.y;

                    if (!this.childPositions.has(child)) {
                        this.childPositions.set(child, targetX);
                    }
                    const currentPosX = this.childPositions.get(child);

                    const newX = currentPosX + (targetX - currentPosX) * AbstractStaticChildLerpableContainer.POSITION_LERP_FACTOR;
                    this.childPositions.set(child, newX);

                    child.setX(newX);
                    child.setY(targetY);
                    child.setW(childLayout.w);
                    child.setH(childLayout.h);

                    currentX +=
                        (computedReverseChildrenRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.w);

                    renderPossibleComponent(ctx, child);
                });

                for (const child of this.childPositions.keys()) {
                    if (!this.children.includes(child)) {
                        this.childPositions.delete(child);
                    }
                }
            } else {
                this.children.forEach(child => {
                    const childLayout = child.layout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x + currentX,
                        originY: this.y,
                    });

                    const targetY = computedCenterChildren
                        ? this.y + (this.h - childLayout.h) / 2
                        : childLayout.y;

                    child.setX(childLayout.x);
                    child.setY(targetY);
                    child.setW(childLayout.w);
                    child.setH(childLayout.h);

                    currentX +=
                        (computedReverseChildrenRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.w);

                    renderPossibleComponent(ctx, child);
                });
            }
        }
    }
}

/**
 * Vertically arranged invisible container.
 */
export class StaticVContainer<Child extends Components = Components> extends AbstractStaticChildLerpableContainer<Child> {
    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        lerpChildren: MaybePointerLike<boolean> = false,

        private readonly centerChildren: MaybePointerLike<boolean> = false,
        private readonly childrenSpacingOverride: MaybePointerLike<number | null> = null,
        private readonly reverseChildrenRender: MaybePointerLike<boolean> = false,
    ) {
        super(
            layoutOptions,

            lerpChildren,
        );
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalHeight = 0;
        let maxWidth = 0;

        const computedChildrenSpacingOverride = Component.computePointerLike(this.childrenSpacingOverride);
        const computedReverseChildrenRender = Component.computePointerLike(this.reverseChildrenRender);

        if (this.children.length > 0) {
            let currentY = 0;

            if (computedReverseChildrenRender && computedChildrenSpacingOverride) {
                currentY = computedChildrenSpacingOverride * (this.children.length - 1);
            }

            this.children.forEach(child => {
                const { w: childW, h: childH } = child.layout(
                    {
                        ctx,

                        containerWidth,
                        containerHeight,

                        originX: 0,
                        originY: currentY,
                    },
                );

                maxWidth = Math.max(maxWidth, childW);

                if (computedChildrenSpacingOverride !== null) {
                    totalHeight = Math.max(totalHeight, currentY + childH);
                    currentY += (computedReverseChildrenRender ? -1 : 1) * computedChildrenSpacingOverride;
                } else {
                    totalHeight = Math.max(totalHeight, currentY + childH);
                    currentY += (computedReverseChildrenRender ? -1 : 1) * childH;
                }
            });

            if (computedReverseChildrenRender) {
                if (computedChildrenSpacingOverride === null) {
                    totalHeight = currentY * -1;
                }
            }
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
        super.render(ctx);

        if (this.children.length > 0) {
            const computedLerpChildren = Component.computePointerLike(this.lerpChildren);

            const computedCenterChildren = Component.computePointerLike(this.centerChildren);
            const computedSpacingOverride = Component.computePointerLike(this.childrenSpacingOverride);
            const computedReverseChildrenRender = Component.computePointerLike(this.reverseChildrenRender);

            let currentY = 0;
            if (computedReverseChildrenRender) {
                if (computedSpacingOverride !== null) {
                    currentY = computedSpacingOverride * (this.children.length - 1);
                } else {
                    for (const child of this.children) {
                        const childLayout = child.layout({
                            ctx,

                            containerWidth: this.w,
                            containerHeight: this.h,

                            originX: this.x,
                            originY: this.y,
                        });

                        currentY += childLayout.h;
                    }

                    currentY -= (
                        this.children[0]?.layout({
                            ctx,

                            containerWidth: this.w,
                            containerHeight: this.h,

                            originX: this.x,
                            originY: this.y,
                        }).h ?? 0
                    );
                }
            }

            if (computedLerpChildren) {
                this.children.forEach(child => {
                    const childLayout = child.layout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x,
                        originY: this.y + currentY,
                    });

                    const targetY = childLayout.y;
                    const targetX = computedCenterChildren
                        ? this.x + (this.w - childLayout.w) / 2
                        : childLayout.x;

                    if (!this.childPositions.has(child)) {
                        this.childPositions.set(child, targetY);
                    }
                    const currentPosY = this.childPositions.get(child);

                    const newY = currentPosY + (targetY - currentPosY) * AbstractStaticChildLerpableContainer.POSITION_LERP_FACTOR;
                    this.childPositions.set(child, newY);

                    child.setX(targetX);
                    child.setY(newY);
                    child.setW(childLayout.w);
                    child.setH(childLayout.h);

                    currentY +=
                        (computedReverseChildrenRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.h);

                    renderPossibleComponent(ctx, child);
                });

                for (const child of this.childPositions.keys()) {
                    if (!this.children.includes(child)) {
                        this.childPositions.delete(child);
                    }
                }
            } else {
                this.children.forEach(child => {
                    const childLayout = child.layout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x,
                        originY: this.y + currentY,
                    });

                    const targetX =
                        computedCenterChildren
                            ? this.x + (this.w - childLayout.w) / 2
                            : childLayout.x;

                    child.setX(targetX);
                    child.setY(childLayout.y);
                    child.setW(childLayout.w);
                    child.setH(childLayout.h);

                    currentY +=
                        (computedReverseChildrenRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.h);

                    renderPossibleComponent(ctx, child);
                });
            }
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