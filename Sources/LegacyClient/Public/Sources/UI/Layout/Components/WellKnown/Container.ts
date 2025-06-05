import type { ColorCode } from "../../../../Utils/Color";
import { darkened, DARKENED_BASE } from "../../../../Utils/Color";
import type { LayoutContext, LayoutOptions, LayoutResult } from "../../Layout";
import Layout from "../../Layout";
import type { Components, MaybePointerLike, AnimationConfigOf, AnimationType, ComponentOpener, ComponentCloser, DummySetVisibleToggleType, DummySetVisibleObserverType, DummySetVisibleParameterType } from "../Component";
import { CENTERING, Component, OBSTRUCTION_AFFECTABLE, renderPossibleComponent, renderPossibleComponents } from "../Component";

type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export type SizeKeys = "w" | "h";

export type CoordinateKeys = "x" | "y";

export type AutomaticallySizedLayoutOptions = Omit<LayoutOptions, SizeKeys>;

/**
 * @remarks
 * The "square size" means that w, h are same and can recive with only one parameters.
 */
export type SquareSizeLayoutOptions = AutomaticallySizedLayoutOptions;

export type PartialSizeLayoutOptions = Optional<LayoutOptions, SizeKeys>;

export type SelectableStaticContainerLayoutOptions = LayoutOptions | AutomaticallySizedLayoutOptions | PartialSizeLayoutOptions;

export type AnyStaticContainer = AbstractStaticContainer<SelectableStaticContainerLayoutOptions, Components>;

/**
 * Container component that can add/render childrens.
 */
export abstract class AbstractStaticContainer<T extends SelectableStaticContainerLayoutOptions, Child extends Components>
    extends Component {
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
        super.setVisible(...(arguments as unknown as DummySetVisibleParameterType));

        // Post-process for component-binded component

        const setChildrenVisible = () => {
            this.children.forEach(child => {
                // Dont animate it, container animation can affected to children
                child.setVisible(<DummySetVisibleToggleType>toggle, <DummySetVisibleObserverType>openerOrCloser, false);
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

    private pushAddChildComponentOperation(child: Child): void {
        const addChildComponentOperation = () => { this.context.addChildComponent(child); };

        if (this.wasInitialized) {
            addChildComponentOperation();
        } else {
            this.afterInitializedOperationQueue.add(addChildComponentOperation);
        }
    }

    /**
     * Add child to this container.
     */
    public addChild(child: Child): this {
        this.children.push(child);

        this.pushAddChildComponentOperation(child);

        return this;
    }

    /**
     * Prepend child to this container.
     */
    public prependChild(child: Child): this {
        this.children.unshift(child);

        this.pushAddChildComponentOperation(child);

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

        closeOnClickedOutside: boolean = false,

        protected readonly color: MaybePointerLike<ColorCode> = "#ffffff",

        protected readonly rectRadii: MaybePointerLike<number> = 1,

        protected readonly strokeWidthLimit: MaybePointerLike<number> = 5,
        protected readonly strokeWidthCoef: MaybePointerLike<number> = 0.07,
    ) {
        super(layout);

        if (closeOnClickedOutside) {
            this.on("onClickedOutside", () => { this.desiredVisible && this.revertAnimation(<ComponentCloser><unknown>(this)); });
        }
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

        const strokeWidth = this.calculateStrokeWidth();

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

            ctx.beginPath();

            ctx.roundRect(this.x, this.y, this.w, this.h, computedRadii);

            ctx.lineWidth = this.calculateStrokeWidth();
            ctx.fillStyle = computedColor;
            ctx.strokeStyle = darkened(computedColor, DARKENED_BASE);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        const { children } = this;

        if (children.length > 0) {
            const strokeWidth = this.calculateStrokeWidth();

            children.forEach(child => {
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
            });

            renderPossibleComponents(ctx, children);
        }
    }

    private calculateStrokeWidth(): number {
        return Math.min(
            Component.computePointerLike(this.strokeWidthLimit),
            Math.min(this.w, this.h) *
            Component.computePointerLike(this.strokeWidthCoef),
        );
    }
}

/**
 * Panel-like view static container but translucent.
 */
export class StaticTranslucentPanelContainer<Child extends Components = Components> extends AbstractStaticContainer<PartialSizeLayoutOptions, Child> {
    constructor(
        layout: MaybePointerLike<PartialSizeLayoutOptions>,

        protected readonly rectRadii: MaybePointerLike<number> = 3,
        protected readonly alphaOverride?: MaybePointerLike<number>,
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
            ) satisfies LayoutOptions,
            lc,
        );
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        const alpha =
            typeof this.alphaOverride !== "undefined"
                ? Component.computePointerLike(this.alphaOverride)
                : ctx.globalAlpha / 2;

        if (alpha > 0) {
            ctx.save();

            const computedRadii = Component.computePointerLike(this.rectRadii);

            ctx.beginPath();

            ctx.roundRect(this.x, this.y, this.w, this.h, computedRadii);

            // 0.5 if globalAlpha is 1
            ctx.globalAlpha = alpha;

            ctx.fillStyle = "black";
            ctx.fill();

            ctx.restore();
        }

        const { children } = this;

        if (children.length > 0) {
            children.forEach(child => {
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
            });

            renderPossibleComponents(ctx, children);
        }
    }
}

export abstract class AbstractStaticChildLerpableContainer<Child extends Components> extends AbstractStaticContainer<AutomaticallySizedLayoutOptions, Child> {
    public override[OBSTRUCTION_AFFECTABLE]: boolean = false;

    protected static readonly POSITION_LERP_FACTOR = 0.1;

    protected childPositions: Map<Child, number> = new Map();

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,

        protected readonly lerpChildren: MaybePointerLike<boolean>,

        protected readonly spacingOverride: MaybePointerLike<number | null>,
        protected readonly reverseRender: MaybePointerLike<boolean>,
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

        spacingOverride: MaybePointerLike<number | null> = null,
        reverseRender: MaybePointerLike<boolean> = false,
    ) {
        super(
            layoutOptions,

            lerpChildren,

            spacingOverride,
            reverseRender,
        );
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalWidth = 0;
        let maxHeight = 0;

        const computedSpacingOverride = Component.computePointerLike(this.spacingOverride);
        const computedReverseRender = Component.computePointerLike(this.reverseRender);

        if (this.children.length > 0) {
            let currentX = 0;

            if (computedReverseRender && computedSpacingOverride) {
                currentX = computedSpacingOverride * (this.children.length - 1);
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

                if (computedSpacingOverride !== null) {
                    totalWidth = Math.max(totalWidth, currentX + childW);

                    currentX += (computedReverseRender ? -1 : 1) * computedSpacingOverride;
                } else {
                    totalWidth = Math.max(totalWidth, currentX + childW);

                    currentX += (computedReverseRender ? -1 : 1) * childW;
                }
            });

            if (computedReverseRender) {
                if (computedSpacingOverride === null) {
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

        const { children } = this;

        if (children.length > 0) {
            const computedLerpChildren = Component.computePointerLike(this.lerpChildren);

            const computedSpacingOverride = Component.computePointerLike(this.spacingOverride);
            const computedReverseRender = Component.computePointerLike(this.reverseRender);

            let currentX = 0;
            if (computedReverseRender) {
                if (computedSpacingOverride !== null) {
                    currentX += computedSpacingOverride * (children.length - 1);
                } else {
                    children.forEach(child => {
                        const childLayout = child.cachedLayout({
                            ctx,

                            containerWidth: this.w,
                            containerHeight: this.h,

                            originX: this.x + currentX,
                            originY: this.y,
                        });

                        currentX += childLayout.w;
                    });

                    currentX -= (
                        children[0]?.cachedLayout({
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
                children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x + currentX,
                        originY: this.y,
                    });

                    const targetX = childLayout.x;

                    if (!this.childPositions.has(child)) {
                        this.childPositions.set(child, targetX);
                    }

                    const currentPosX = this.childPositions.get(child);

                    const newX = currentPosX + (targetX - currentPosX) * AbstractStaticChildLerpableContainer.POSITION_LERP_FACTOR;
                    this.childPositions.set(child, newX);

                    if (child.isLayoutable) {
                        const targetY =
                            child[CENTERING]
                                ? this.y + (this.h - childLayout.h) / 2
                                : childLayout.y;

                        child.setX(newX);
                        child.setY(targetY);
                        child.setW(childLayout.w);
                        child.setH(childLayout.h);
                    }

                    currentX +=
                        (computedReverseRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.w);
                });

                renderPossibleComponents(ctx, children);

                for (const child of this.childPositions.keys()) {
                    if (!children.includes(child)) {
                        this.childPositions.delete(child);
                    }
                }
            } else {
                children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x + currentX,
                        originY: this.y,
                    });

                    if (child.isLayoutable) {
                        const targetY =
                            child[CENTERING]
                                ? this.y + (this.h - childLayout.h) / 2
                                : childLayout.y;

                        child.setX(childLayout.x);
                        child.setY(targetY);
                        child.setW(childLayout.w);
                        child.setH(childLayout.h);
                    }

                    currentX +=
                        (computedReverseRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.w);
                });

                renderPossibleComponents(ctx, children);
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

        spacingOverride: MaybePointerLike<number | null> = null,
        reverseRender: MaybePointerLike<boolean> = false,
    ) {
        super(
            layoutOptions,

            lerpChildren,

            spacingOverride,
            reverseRender,
        );
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx, containerWidth, containerHeight } = lc;

        let totalHeight = 0;
        let maxWidth = 0;

        const computedSpacingOverride = Component.computePointerLike(this.spacingOverride);
        const computedReverseRender = Component.computePointerLike(this.reverseRender);

        if (this.children.length > 0) {
            let currentY = 0;

            if (computedReverseRender && computedSpacingOverride) {
                currentY = computedSpacingOverride * (this.children.length - 1);
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

                if (computedSpacingOverride !== null) {
                    totalHeight = Math.max(totalHeight, currentY + childH);

                    currentY += (computedReverseRender ? -1 : 1) * computedSpacingOverride;
                } else {
                    totalHeight = Math.max(totalHeight, currentY + childH);

                    currentY += (computedReverseRender ? -1 : 1) * childH;
                }
            });

            if (computedReverseRender) {
                if (computedSpacingOverride === null) {
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

        const { children } = this;

        if (children.length > 0) {
            const computedLerpChildren = Component.computePointerLike(this.lerpChildren);

            const computedSpacingOverride = Component.computePointerLike(this.spacingOverride);
            const computedReverseRender = Component.computePointerLike(this.reverseRender);

            let currentY = 0;
            if (computedReverseRender) {
                if (computedSpacingOverride !== null) {
                    currentY = computedSpacingOverride * (children.length - 1);
                } else {
                    for (const child of children) {
                        const childLayout = child.cachedLayout({
                            ctx,

                            containerWidth: this.w,
                            containerHeight: this.h,

                            originX: this.x,
                            originY: this.y,
                        });

                        currentY += childLayout.h;
                    }

                    currentY -= (
                        children[0]?.cachedLayout({
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
                children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x,
                        originY: this.y + currentY,
                    });

                    const targetY = childLayout.y;

                    if (!this.childPositions.has(child)) {
                        this.childPositions.set(child, targetY);
                    }

                    const currentPosY = this.childPositions.get(child);

                    const newY = currentPosY + (targetY - currentPosY) * AbstractStaticChildLerpableContainer.POSITION_LERP_FACTOR;
                    this.childPositions.set(child, newY);

                    if (child.isLayoutable) {
                        const targetX =
                            child[CENTERING]
                                ? this.x + (this.w - childLayout.w) / 2
                                : childLayout.x;

                        child.setX(targetX);
                        child.setY(newY);
                        child.setW(childLayout.w);
                        child.setH(childLayout.h);
                    }

                    currentY +=
                        (computedReverseRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.h);
                });

                renderPossibleComponents(ctx, children);

                for (const child of this.childPositions.keys()) {
                    if (!children.includes(child)) {
                        this.childPositions.delete(child);
                    }
                }
            } else {
                children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,

                        containerWidth: this.w,
                        containerHeight: this.h,

                        originX: this.x,
                        originY: this.y + currentY,
                    });

                    if (child.isLayoutable) {
                        const targetX =
                            child[CENTERING]
                                ? this.x + (this.w - childLayout.w) / 2
                                : childLayout.x;

                        child.setX(targetX);
                        child.setY(childLayout.y);
                        child.setW(childLayout.w);
                        child.setH(childLayout.h);
                    }

                    currentY +=
                        (computedReverseRender ? -1 : 1) *
                        (computedSpacingOverride ?? childLayout.h);
                });

                renderPossibleComponents(ctx, children);
            }
        }
    }
}

function lerp(start: number, end: number, alpha: number): number {
    return start * (1 - alpha) + end * alpha;
}

/**
 * Scrollable container with vertical scrollbar.
 */
export class StaticScrollableContainer<Child extends Components = Components> extends AbstractStaticContainer<LayoutOptions, Child> {
    private static readonly ON_SCROLLED_ALPHA: number = 0.075;
    private static readonly SCROLLED_WITH_BAR_ALPHA: number = 0.2;

    private static readonly SCROLL_SPEED: number = 15;

    private currentScrollY: number = 0;
    private targetScrollY: number = 0;
    private scrollYAlpha: number = 1;
    private isDragging: boolean = false;
    private wasPointed: boolean = false;
    private lastMouseY: number = 0;
    private contentHeight: number = 0;

    constructor(
        layoutOptions: MaybePointerLike<LayoutOptions>,

        private readonly scrollBarWidth: number = 5.5,
        private readonly scrollBarHeight: number = 30,
    ) {
        super(layoutOptions);

        this.on("onMouseDown", (e) => this.handleMouseDown(e));
        this.on("onMouseMove", (e) => this.handleMouseMove(e));
        this.on("onMouseUp", () => this.handleMouseUp());
        this.on("onScroll", (e) => this.handleScroll(e));
    }

    private get scrollBarMetrics() {
        const {
            currentScrollY,
            scrollBarWidth, scrollBarHeight,
            contentHeight,
            x, y,
            w, h,
        } = this;

        const visibleHeight = h - scrollBarHeight;
        const scrollBarY = y + (currentScrollY / contentHeight) * visibleHeight;

        return {
            x: x + w - scrollBarWidth,
            y: scrollBarY,

            width: scrollBarWidth,
            height: scrollBarHeight,

            visibleHeight,
        };
    }

    private isPointInScrollBar(x: number, y: number): boolean {
        const { x: barX, y: barY, width, height } = this.scrollBarMetrics;

        return x >= barX && x <= barX + width && y >= barY && y <= barY + height;
    }

    private handleMouseDown(e: MouseEvent): void {
        const { mouseX, mouseY } = this.context;

        if (this.isPointInScrollBar(mouseX, mouseY)) {
            this.isDragging = true;

            this.lastMouseY = mouseY;
        }
    }

    private updateCursor(): void {
        const { mouseX, mouseY } = this.context;
        const isOverScrollBar = this.isPointInScrollBar(mouseX, mouseY);

        if (isOverScrollBar && !this.wasPointed) {
            this.context.canvas.style.cursor = "pointer";

            this.wasPointed = true;
        } else if (!isOverScrollBar && this.wasPointed) {
            this.context.canvas.style.cursor = "default";

            this.wasPointed = false;
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        this.updateCursor();

        if (!this.isDragging) return;

        const mouseY = this.context.mouseY;
        const delta = mouseY - this.lastMouseY;
        this.lastMouseY = mouseY;

        const metrics = this.scrollBarMetrics;
        const scrollRatio = metrics.visibleHeight / this.contentHeight;
        const scrollMove = delta / scrollRatio;

        this.targetScrollY = Math.max(0, Math.min(this.contentHeight, this.targetScrollY + scrollMove));
        this.scrollYAlpha = StaticScrollableContainer.SCROLLED_WITH_BAR_ALPHA;
    }

    private handleMouseUp(): void {
        this.isDragging = false;
    }

    private handleScroll(e: WheelEvent): void {
        this.targetScrollY = Math.max(
            0,
            Math.min(
                this.contentHeight,
                this.targetScrollY +
                (
                    e.deltaY >= 0
                        ? StaticScrollableContainer.SCROLL_SPEED
                        : -StaticScrollableContainer.SCROLL_SPEED
                ),
            ),
        );

        this.scrollYAlpha = StaticScrollableContainer.ON_SCROLLED_ALPHA;
    }

    // As said in render, scroll can use memory lots
    override cachedLayout(lc: LayoutContext): LayoutResult {
        return this.layout(lc);
    }

    // Its redundant to generate cache key
    override getCacheKey(lc: LayoutContext): string {
        return "";
    }

    override layout(lc: LayoutContext): LayoutResult {
        const { ctx } = lc;
        const result = Layout.layout(Component.computePointerLike(this.layoutOptions), lc);

        if (this.children.length > 0) {
            let totalHeight = 0;
            let maxY = 0;

            this.children.forEach(child => {
                const { y: childY, h: childH } = child.layout(
                    {
                        ctx,

                        containerWidth: result.w - this.scrollBarWidth * 2,
                        containerHeight: result.h,

                        originX: 0,
                        originY: 0,
                    },
                );

                totalHeight += childH;
                maxY = Math.max(maxY, childY);
            });

            this.contentHeight = totalHeight + (maxY - result.h);
        }

        return result;
    }

    override render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx);

        { // Lerp scroll
            this.currentScrollY = lerp(this.currentScrollY, this.targetScrollY, this.scrollYAlpha);
        }

        ctx.save();

        ctx.beginPath();

        ctx.rect(this.x, this.y, this.w - this.scrollBarWidth, this.h);

        ctx.clip();

        if (this.children.length > 0) {
            let currentY = -this.currentScrollY;

            this.children.forEach(child => {
                // Scroll can very very consume memory, so just simply use layout
                const childLayout = child.layout({
                    ctx,

                    containerWidth: this.w - this.scrollBarWidth * 2,
                    containerHeight: this.h,

                    originX: this.x,
                    originY: this.y + currentY,
                });

                if (child.isLayoutable) {
                    const desiredX =
                        child[CENTERING]
                            ? this.x + (this.w - childLayout.w) / 2
                            : childLayout.x;

                    child.setX(desiredX);
                    child.setY(childLayout.y);
                    child.setW(childLayout.w);
                    child.setH(childLayout.h);
                }

                if (childLayout.y + childLayout.h >= this.y && childLayout.y <= this.y + this.h) {
                    renderPossibleComponent(ctx, child);
                }

                currentY += childLayout.h;
            });
        }

        ctx.restore();

        const metrics = this.scrollBarMetrics;

        ctx.beginPath();

        ctx.roundRect(
            metrics.x,
            metrics.y,
            metrics.width,
            metrics.height,
            metrics.width / 2,
        );

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "black";
        ctx.fill();
    }
}

type MaybePointerLikeNumber = MaybePointerLike<number>;

/**
 * Component that just consume space.
 * 
 * @remarks
 * This is only used for containers whose coordinates are automatically determined (e.g. StaticHContainer).
 */
export class StaticSpace extends Component {
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