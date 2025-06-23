"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinatedStaticSpace = exports.StaticSpace = exports.StaticScrollableContainer = exports.StaticVContainer = exports.StaticHContainer = exports.AbstractStaticChildLerpableContainer = exports.StaticTranslucentPanelContainer = exports.StaticPanelContainer = exports.AbstractStaticContainer = void 0;
const Color_1 = require("../../../../Utils/Color");
const Layout_1 = __importDefault(require("../../Layout"));
const Component_1 = require("../Component");
/**
 * Container component that can add/render childrens.
 */
class AbstractStaticContainer extends Component_1.Component {
    constructor(layoutOptions) {
        super();
        this.layoutOptions = layoutOptions;
        this.children = new Array();
        this.wasInitialized = false;
        this.afterInitializedOperationQueue = new Set();
        // Disable zoom animation slide for container
        this.animationZoomShouldSlidePosition = false;
        this.once("onInitialized", () => {
            this.wasInitialized = true;
            this.afterInitializedOperationQueue.forEach(op => op());
            this.afterInitializedOperationQueue.clear();
            this.afterInitializedOperationQueue = null;
        });
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component_1.Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER) +
            CACHE_KEY_DELIMITER +
            Array.from(this.children).map(c => c.getCacheKey(lc)).join(CACHE_KEY_DELIMITER);
    }
    invalidateLayoutCache() {
        this.layoutCache.invalidate();
        // Invalidate children layout cache too
        this.children.forEach(child => child.invalidateLayoutCache());
    }
    setVisible(toggle, openerOrCloser, shouldAnimate, animationType, animationConfig = {}) {
        super.setVisible(...arguments);
        // Post-process for component-binded component
        const setChildrenVisible = () => {
            this.children.forEach(child => {
                // Dont animate it, container animation can affected to children
                child.setVisible(toggle, openerOrCloser, false);
            });
        };
        if (!toggle && shouldAnimate) {
            this.once("onOutAnimationEnd", setChildrenVisible);
        }
        else {
            setChildrenVisible();
        }
    }
    destroy() {
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
    addChildren(...children) {
        children.forEach(child => this.addChild(child));
        return this;
    }
    /**
     * Return the copy of cildren.
     */
    getChildren() {
        return this.children.slice();
    }
    /**
     * Sort the children.
     */
    sortChildren(compareFn) {
        this.children.sort(compareFn);
    }
    pushAddChildComponentOperation(child) {
        const addChildComponentOperation = () => { this.context.addChildComponent(child); };
        if (this.wasInitialized) {
            addChildComponentOperation();
        }
        else {
            this.afterInitializedOperationQueue.add(addChildComponentOperation);
        }
    }
    /**
     * Add child to this container.
     */
    addChild(child) {
        this.children.push(child);
        this.pushAddChildComponentOperation(child);
        return this;
    }
    /**
     * Prepend child to this container.
     */
    prependChild(child) {
        this.children.unshift(child);
        this.pushAddChildComponentOperation(child);
        return this;
    }
    /**
     * Remove child from this container.
     */
    removeChild(child) {
        // No need to call destroy method, can done by removeComponent
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        const removeChildComponentOperation = () => { this.context.removeChildComponent(child); };
        if (this.wasInitialized) {
            removeChildComponentOperation();
        }
        else {
            this.afterInitializedOperationQueue.add(removeChildComponentOperation);
        }
        return this;
    }
    /**
     * Check if the component is child of this container.
     */
    hasChild(child) {
        return this.children.includes(child);
    }
}
exports.AbstractStaticContainer = AbstractStaticContainer;
/**
 * Panel-like view static container.
 */
class StaticPanelContainer extends AbstractStaticContainer {
    constructor(layout, closeOnClickedOutside = false, color = "#ffffff", rectRadii = 1, strokeWidthLimit = 5, strokeWidthCoef = 0.07) {
        super(layout);
        this.color = color;
        this.rectRadii = rectRadii;
        this.strokeWidthLimit = strokeWidthLimit;
        this.strokeWidthCoef = strokeWidthCoef;
        if (closeOnClickedOutside) {
            this.on("onClickedOutside", () => { this.desiredVisible && this.revertAnimation((this)); });
        }
    }
    layout(lc) {
        const { ctx, containerWidth, containerHeight } = lc;
        let maxW = 0, maxH = 0;
        if (this.children.length > 0) {
            this.children.forEach(child => {
                const { x: childX, y: childY, w: childW, h: childH } = child.layout({
                    ctx,
                    containerWidth,
                    containerHeight,
                    // Dont use x, y because only wanted size from origin (0, 0)
                    originX: 0,
                    originY: 0,
                });
                maxW = Math.max(maxW, childX + childW);
                maxH = Math.max(maxH, childY + childH);
            });
        }
        const strokeWidth = this.calculateStrokeWidth();
        const options = Object.assign({
            w: maxW,
            h: maxH,
        }, Component_1.Component.computePointerLike(this.layoutOptions));
        if (typeof options.w === "number")
            options.w += strokeWidth * 2;
        if (typeof options.h === "number")
            options.h += strokeWidth * 2;
        return Layout_1.default.layout(options, lc);
    }
    render(ctx) {
        super.render(ctx);
        { // Draw the background panel
            ctx.save();
            const computedColor = Component_1.Component.computePointerLike(this.color);
            const computedRadii = Component_1.Component.computePointerLike(this.rectRadii);
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, computedRadii);
            ctx.lineWidth = this.calculateStrokeWidth();
            ctx.fillStyle = computedColor;
            ctx.strokeStyle = (0, Color_1.darkened)(computedColor, Color_1.DARKENED_BASE);
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
            (0, Component_1.renderPossibleComponents)(ctx, children);
        }
    }
    calculateStrokeWidth() {
        return Math.min(Component_1.Component.computePointerLike(this.strokeWidthLimit), Math.min(this.w, this.h) *
            Component_1.Component.computePointerLike(this.strokeWidthCoef));
    }
}
exports.StaticPanelContainer = StaticPanelContainer;
/**
 * Panel-like view static container but translucent.
 */
class StaticTranslucentPanelContainer extends AbstractStaticContainer {
    constructor(layout, rectRadii = 3, alphaOverride) {
        super(layout);
        this.rectRadii = rectRadii;
        this.alphaOverride = alphaOverride;
    }
    layout(lc) {
        const { ctx, containerWidth, containerHeight } = lc;
        let maxW = 0, maxH = 0;
        if (this.children.length > 0) {
            this.children.forEach(child => {
                const { x: childX, y: childY, w: childW, h: childH } = child.layout({
                    ctx,
                    containerWidth,
                    containerHeight,
                    // Dont use x, y because only wanted size from origin (0, 0)
                    originX: 0,
                    originY: 0,
                });
                maxW = Math.max(maxW, childX + childW);
                maxH = Math.max(maxH, childY + childH);
            });
        }
        return Layout_1.default.layout(Object.assign({
            w: maxW,
            h: maxH,
        }, Component_1.Component.computePointerLike(this.layoutOptions)), lc);
    }
    render(ctx) {
        super.render(ctx);
        const alpha = typeof this.alphaOverride !== "undefined"
            ? Component_1.Component.computePointerLike(this.alphaOverride)
            : ctx.globalAlpha / 2;
        if (alpha > 0) {
            ctx.save();
            const computedRadii = Component_1.Component.computePointerLike(this.rectRadii);
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
            (0, Component_1.renderPossibleComponents)(ctx, children);
        }
    }
}
exports.StaticTranslucentPanelContainer = StaticTranslucentPanelContainer;
class AbstractStaticChildLerpableContainer extends AbstractStaticContainer {
    static { _a = Component_1.OBSTRUCTION_AFFECTABLE; }
    static { this.POSITION_LERP_FACTOR = 0.1; }
    constructor(layoutOptions, lerpChildren, spacingOverride, reverseRender) {
        super(layoutOptions);
        this.lerpChildren = lerpChildren;
        this.spacingOverride = spacingOverride;
        this.reverseRender = reverseRender;
        this[_a] = false;
        this.childPositions = new Map();
    }
    destroy() {
        this.childPositions.clear();
        this.childPositions = null;
        super.destroy();
    }
}
exports.AbstractStaticChildLerpableContainer = AbstractStaticChildLerpableContainer;
/**
 * Horizontally arranged invisible container.
 */
class StaticHContainer extends AbstractStaticChildLerpableContainer {
    constructor(layoutOptions, lerpChildren = false, spacingOverride = null, reverseRender = false) {
        super(layoutOptions, lerpChildren, spacingOverride, reverseRender);
    }
    layout(lc) {
        const { ctx, containerWidth, containerHeight } = lc;
        let totalWidth = 0;
        let maxHeight = 0;
        const computedSpacingOverride = Component_1.Component.computePointerLike(this.spacingOverride);
        const computedReverseRender = Component_1.Component.computePointerLike(this.reverseRender);
        if (this.children.length > 0) {
            let currentX = 0;
            if (computedReverseRender && computedSpacingOverride) {
                currentX = computedSpacingOverride * (this.children.length - 1);
            }
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.layout({
                    ctx,
                    containerWidth,
                    containerHeight,
                    originX: currentX,
                    originY: 0,
                });
                maxHeight = Math.max(maxHeight, childH);
                if (computedSpacingOverride !== null) {
                    totalWidth = Math.max(totalWidth, currentX + childW);
                    currentX += (computedReverseRender ? -1 : 1) * computedSpacingOverride;
                }
                else {
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
        return Layout_1.default.layout({
            ...Component_1.Component.computePointerLike(this.layoutOptions),
            w: totalWidth,
            h: maxHeight,
        }, lc);
    }
    render(ctx) {
        super.render(ctx);
        const { children } = this;
        if (children.length > 0) {
            const computedLerpChildren = Component_1.Component.computePointerLike(this.lerpChildren);
            const computedSpacingOverride = Component_1.Component.computePointerLike(this.spacingOverride);
            const computedReverseRender = Component_1.Component.computePointerLike(this.reverseRender);
            let currentX = 0;
            if (computedReverseRender) {
                if (computedSpacingOverride !== null) {
                    currentX += computedSpacingOverride * (children.length - 1);
                }
                else {
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
                    currentX -= (children[0]?.cachedLayout({
                        ctx,
                        containerWidth: this.w,
                        containerHeight: this.h,
                        originX: this.x,
                        originY: this.y,
                    }).w ?? 0);
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
                        const targetY = child[Component_1.CENTERING]
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
                (0, Component_1.renderPossibleComponents)(ctx, children);
                for (const child of this.childPositions.keys()) {
                    if (!children.includes(child)) {
                        this.childPositions.delete(child);
                    }
                }
            }
            else {
                children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,
                        containerWidth: this.w,
                        containerHeight: this.h,
                        originX: this.x + currentX,
                        originY: this.y,
                    });
                    if (child.isLayoutable) {
                        const targetY = child[Component_1.CENTERING]
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
                (0, Component_1.renderPossibleComponents)(ctx, children);
            }
        }
    }
}
exports.StaticHContainer = StaticHContainer;
/**
 * Vertically arranged invisible container.
 */
class StaticVContainer extends AbstractStaticChildLerpableContainer {
    constructor(layoutOptions, lerpChildren = false, spacingOverride = null, reverseRender = false) {
        super(layoutOptions, lerpChildren, spacingOverride, reverseRender);
    }
    layout(lc) {
        const { ctx, containerWidth, containerHeight } = lc;
        let totalHeight = 0;
        let maxWidth = 0;
        const computedSpacingOverride = Component_1.Component.computePointerLike(this.spacingOverride);
        const computedReverseRender = Component_1.Component.computePointerLike(this.reverseRender);
        if (this.children.length > 0) {
            let currentY = 0;
            if (computedReverseRender && computedSpacingOverride) {
                currentY = computedSpacingOverride * (this.children.length - 1);
            }
            this.children.forEach(child => {
                const { w: childW, h: childH } = child.layout({
                    ctx,
                    containerWidth,
                    containerHeight,
                    originX: 0,
                    originY: currentY,
                });
                maxWidth = Math.max(maxWidth, childW);
                if (computedSpacingOverride !== null) {
                    totalHeight = Math.max(totalHeight, currentY + childH);
                    currentY += (computedReverseRender ? -1 : 1) * computedSpacingOverride;
                }
                else {
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
        return Layout_1.default.layout({
            ...Component_1.Component.computePointerLike(this.layoutOptions),
            w: maxWidth,
            h: totalHeight,
        }, lc);
    }
    render(ctx) {
        super.render(ctx);
        const { children } = this;
        if (children.length > 0) {
            const computedLerpChildren = Component_1.Component.computePointerLike(this.lerpChildren);
            const computedSpacingOverride = Component_1.Component.computePointerLike(this.spacingOverride);
            const computedReverseRender = Component_1.Component.computePointerLike(this.reverseRender);
            let currentY = 0;
            if (computedReverseRender) {
                if (computedSpacingOverride !== null) {
                    currentY = computedSpacingOverride * (children.length - 1);
                }
                else {
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
                    currentY -= (children[0]?.cachedLayout({
                        ctx,
                        containerWidth: this.w,
                        containerHeight: this.h,
                        originX: this.x,
                        originY: this.y,
                    }).h ?? 0);
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
                        const targetX = child[Component_1.CENTERING]
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
                (0, Component_1.renderPossibleComponents)(ctx, children);
                for (const child of this.childPositions.keys()) {
                    if (!children.includes(child)) {
                        this.childPositions.delete(child);
                    }
                }
            }
            else {
                children.forEach(child => {
                    const childLayout = child.cachedLayout({
                        ctx,
                        containerWidth: this.w,
                        containerHeight: this.h,
                        originX: this.x,
                        originY: this.y + currentY,
                    });
                    if (child.isLayoutable) {
                        const targetX = child[Component_1.CENTERING]
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
                (0, Component_1.renderPossibleComponents)(ctx, children);
            }
        }
    }
}
exports.StaticVContainer = StaticVContainer;
function lerp(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}
/**
 * Scrollable container with vertical scrollbar.
 */
class StaticScrollableContainer extends AbstractStaticContainer {
    static { this.ON_SCROLLED_ALPHA = 0.075; }
    static { this.SCROLLED_WITH_BAR_ALPHA = 0.2; }
    static { this.SCROLL_SPEED = 15; }
    constructor(layoutOptions, scrollBarWidth = 5.5, scrollBarHeight = 30) {
        super(layoutOptions);
        this.scrollBarWidth = scrollBarWidth;
        this.scrollBarHeight = scrollBarHeight;
        this.currentScrollY = 0;
        this.targetScrollY = 0;
        this.scrollYAlpha = 1;
        this.isDragging = false;
        this.wasPointed = false;
        this.lastMouseY = 0;
        this.contentHeight = 0;
        this.on("onMouseDown", (e) => this.handleMouseDown(e));
        this.on("onMouseMove", (e) => this.handleMouseMove(e));
        this.on("onMouseUp", () => this.handleMouseUp());
        this.on("onScroll", (e) => this.handleScroll(e));
    }
    get scrollBarMetrics() {
        const { currentScrollY, scrollBarWidth, scrollBarHeight, contentHeight, x, y, w, h, } = this;
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
    isPointInScrollBar(x, y) {
        const { x: barX, y: barY, width, height } = this.scrollBarMetrics;
        return x >= barX && x <= barX + width && y >= barY && y <= barY + height;
    }
    handleMouseDown(e) {
        const { mouseX, mouseY } = this.context;
        if (this.isPointInScrollBar(mouseX, mouseY)) {
            this.isDragging = true;
            this.lastMouseY = mouseY;
        }
    }
    updateCursor() {
        const { mouseX, mouseY } = this.context;
        const isOverScrollBar = this.isPointInScrollBar(mouseX, mouseY);
        if (isOverScrollBar && !this.wasPointed) {
            this.context.canvas.style.cursor = "pointer";
            this.wasPointed = true;
        }
        else if (!isOverScrollBar && this.wasPointed) {
            this.context.canvas.style.cursor = "default";
            this.wasPointed = false;
        }
    }
    handleMouseMove(e) {
        this.updateCursor();
        if (!this.isDragging)
            return;
        const mouseY = this.context.mouseY;
        const delta = mouseY - this.lastMouseY;
        this.lastMouseY = mouseY;
        const metrics = this.scrollBarMetrics;
        const scrollRatio = metrics.visibleHeight / this.contentHeight;
        const scrollMove = delta / scrollRatio;
        this.targetScrollY = Math.max(0, Math.min(this.contentHeight, this.targetScrollY + scrollMove));
        this.scrollYAlpha = StaticScrollableContainer.SCROLLED_WITH_BAR_ALPHA;
    }
    handleMouseUp() {
        this.isDragging = false;
    }
    handleScroll(e) {
        this.targetScrollY = Math.max(0, Math.min(this.contentHeight, this.targetScrollY +
            (e.deltaY >= 0
                ? StaticScrollableContainer.SCROLL_SPEED
                : -StaticScrollableContainer.SCROLL_SPEED)));
        this.scrollYAlpha = StaticScrollableContainer.ON_SCROLLED_ALPHA;
    }
    // As said in render, scroll can use memory lots
    cachedLayout(lc) {
        return this.layout(lc);
    }
    // Its redundant to generate cache key
    getCacheKey(lc) {
        return "";
    }
    layout(lc) {
        const { ctx } = lc;
        const result = Layout_1.default.layout(Component_1.Component.computePointerLike(this.layoutOptions), lc);
        if (this.children.length > 0) {
            let totalHeight = 0;
            let maxY = 0;
            this.children.forEach(child => {
                const { y: childY, h: childH } = child.layout({
                    ctx,
                    containerWidth: result.w - this.scrollBarWidth * 2,
                    containerHeight: result.h,
                    originX: 0,
                    originY: 0,
                });
                totalHeight += childH;
                maxY = Math.max(maxY, childY);
            });
            this.contentHeight = totalHeight + (maxY - result.h);
        }
        return result;
    }
    render(ctx) {
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
                    const desiredX = child[Component_1.CENTERING]
                        ? this.x + (this.w - childLayout.w) / 2
                        : childLayout.x;
                    child.setX(desiredX);
                    child.setY(childLayout.y);
                    child.setW(childLayout.w);
                    child.setH(childLayout.h);
                }
                if (childLayout.y + childLayout.h >= this.y && childLayout.y <= this.y + this.h) {
                    (0, Component_1.renderPossibleComponent)(ctx, child);
                }
                currentY += childLayout.h;
            });
        }
        ctx.restore();
        const metrics = this.scrollBarMetrics;
        ctx.beginPath();
        ctx.roundRect(metrics.x, metrics.y, metrics.width, metrics.height, metrics.width / 2);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "black";
        ctx.fill();
    }
}
exports.StaticScrollableContainer = StaticScrollableContainer;
/**
 * Component that just consume space.
 *
 * @remarks
 * This is only used for containers whose coordinates are automatically determined (e.g. StaticHContainer).
 */
class StaticSpace extends Component_1.Component {
    static { _b = Component_1.OBSTRUCTION_AFFECTABLE; }
    constructor(sw, sh) {
        super();
        this.sw = sw;
        this.sh = sh;
        this[_b] = false;
    }
    layout({ originX, originY }) {
        return {
            x: originX,
            y: originY,
            w: Component_1.Component.computePointerLike(this.sw),
            h: Component_1.Component.computePointerLike(this.sh),
        };
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Component_1.Component.computePointerLike(this.sw) +
            CACHE_KEY_DELIMITER +
            Component_1.Component.computePointerLike(this.sh);
    }
    invalidateLayoutCache() {
        this.layoutCache.invalidate();
    }
    render(ctx) { }
}
exports.StaticSpace = StaticSpace;
/**
 * Component that just consume space, but has coordinate.
 */
class CoordinatedStaticSpace extends StaticSpace {
    constructor(sw, sh, sx, sy) {
        super(sw, sh);
        this.sx = sx;
        this.sy = sy;
    }
    layout({ originX, originY }) {
        return {
            x: originX + Component_1.Component.computePointerLike(this.sx),
            y: originY + Component_1.Component.computePointerLike(this.sy),
            w: Component_1.Component.computePointerLike(this.sw),
            h: Component_1.Component.computePointerLike(this.sh),
        };
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Component_1.Component.computePointerLike(this.sx) +
            CACHE_KEY_DELIMITER +
            Component_1.Component.computePointerLike(this.sy);
    }
}
exports.CoordinatedStaticSpace = CoordinatedStaticSpace;
