"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = exports.CENTERING = exports.RENDERED_LAST = exports.OBSTRUCTION_AFFECTABLE = exports.sortComponents = void 0;
exports.renderPossibleComponent = renderPossibleComponent;
exports.renderPossibleComponents = renderPossibleComponents;
exports.hasInteractiveListeners = hasInteractiveListeners;
exports.hasClickableListeners = hasClickableListeners;
exports.hasOnScrollListener = hasOnScrollListener;
const LayoutCache_1 = __importDefault(require("../LayoutCache"));
const strict_event_emitter_1 = require("strict-event-emitter");
const OBSERVER_BRAND = Symbol("observerBrand");
function renderPossibleComponent(ctx, component) {
    if (component.isRenderable) {
        ctx.save();
        component.render(ctx);
        ctx.restore();
    }
}
// TODO: this sort the components in the "container" not global, so its not possible to rendered last than other components outside the container
const sortComponents = (components) => components.toSorted((a, b) => Number(a[exports.RENDERED_LAST]) - Number(b[exports.RENDERED_LAST]));
exports.sortComponents = sortComponents;
/**
 * Render all visible components.
 *
 * @param components - Components to render
 */
function renderPossibleComponents(ctx, components) {
    for (const component of (0, exports.sortComponents)(components))
        renderPossibleComponent(ctx, component);
}
const getKeys = (obj) => {
    return Object.keys(obj);
};
// Mouse events
const INTERACTIVE_EVENTS = {
    "onFocus": [],
    "onBlur": [],
};
const INTERACTIVE_EVENT_NAMES = getKeys(INTERACTIVE_EVENTS);
const CLICKABLE_EVENTS = {
    "onClick": [],
    "onDown": [],
    "onUp": [],
};
const CLICKABLE_EVENT_NAMES = getKeys(CLICKABLE_EVENTS);
function hasInteractiveListeners(component) {
    for (const eventName of INTERACTIVE_EVENT_NAMES) {
        if (component.listenerCount(eventName) > 0)
            return true;
    }
    return false;
}
function hasClickableListeners(component) {
    for (const eventName of CLICKABLE_EVENT_NAMES) {
        if (component.listenerCount(eventName) > 0)
            return true;
    }
    return false;
}
function hasOnScrollListener(component) {
    return component.listenerCount("onScroll") > 0;
}
/**
 * Symbol that affected to obstruction checking.
 */
exports.OBSTRUCTION_AFFECTABLE = Symbol("obstructionAffectable");
/**
 * Symbol that tell UI this component is rendered last.
 */
exports.RENDERED_LAST = Symbol("renderedLast");
/**
 * Symbol that tell container should center the child.
 */
exports.CENTERING = Symbol("centering");
/**
 * Base Component class for all UI components.
 */
class Component extends strict_event_emitter_1.Emitter {
    constructor() {
        super(...arguments);
        // Prepare base symbols
        this[_a] = true;
        this[_b] = false;
        this[_c] = false;
        this.isAnimating = false;
        // These are should not null"ed on animation done
        this.animationType = null;
        this.animationDirection = null;
        this.animationProgress = 1;
        this.animationDefaultDurationOverride = null;
        // These can null"ed on animation done
        this.animationStartTime = null;
        /**
         * Component is visible, or not.
         */
        this.visible = true;
        /**
         * Desired visible.
         *
         * @remarks
         * Normal visible only set false when animation done, but this will force display the visible.
         */
        this.desiredVisible = true;
        /**
         * Determine if should move position while animating zoom animation.
         */
        this.animationZoomShouldSlidePosition = true;
        /**
         * Layout cacher.
         */
        this.layoutCache = new LayoutCache_1.default();
        /**
         * Real position to store original position to animations.
         */
        this.realX = 0;
        this.realY = 0;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.#isLayoutable_accessor_storage = true;
    }
    static { _a = exports.OBSTRUCTION_AFFECTABLE, _b = exports.RENDERED_LAST, _c = exports.CENTERING; }
    static { this.ANIMATION_DEFAULT_DURATIONS = {
        [0 /* AnimationType.ZOOM */]: 200,
        [1 /* AnimationType.SLIDE */]: 350,
        [2 /* AnimationType.FADE */]: 1000,
        [3 /* AnimationType.CARD */]: 750,
    }; }
    static { this.ANIMATION_EASING_FUNCTIONS = {
        [0 /* AnimationType.ZOOM */]: {
            in: function easeInOutExpo(x) {
                return x === 0
                    ? 0
                    : x === 1
                        ? 1
                        : x < 0.5
                            ? Math.pow(2, 20 * x - 10) / 2
                            : (2 - Math.pow(2, -20 * x + 10)) / 2;
            },
            out: function easeInExpo(x) {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
        [1 /* AnimationType.SLIDE */]: {
            in: function easeOutExpo(x) {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            },
            out: function easeInExpo(x) {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
        [2 /* AnimationType.FADE */]: {
            in: function linear(x) {
                return x;
            },
            out: function linear(x) {
                return x;
            },
        },
        [3 /* AnimationType.CARD */]: {
            in: function easeOutExpo(x) {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            },
            out: function easeInExpo(x) {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
    }; }
    static { this.SLIDE_DEFAULT_DEPTH_OFFSET = 20; }
    static { this.ZOOM_OUT_DEPTH = 20; }
    // Wrap these prop so components can update realX, realY dynamically
    // Although component can override method and can use it
    setX(x) { this.realX = x; this.x = x; }
    setY(y) { this.realY = y; this.y = y; }
    setW(w) { this.w = w; }
    setH(h) { this.h = h; }
    /**
     * Determine if this component will render.
     */
    get isRenderable() {
        return this.visible || this.isAnimating;
    }
    /**
     * Determine if can this component unvisible within animation.
     */
    get isOutAnimatable() {
        return this.visible && !this.isAnimating;
    }
    #isLayoutable_accessor_storage;
    get isLayoutable() { return this.#isLayoutable_accessor_storage; }
    set isLayoutable(value) { this.#isLayoutable_accessor_storage = value; }
    /**
     * Cached layout method to reduce lags.
     */
    cachedLayout(lc) {
        const { containerWidth, containerHeight, originX, originY } = lc;
        const { CACHE_KEY_DELIMITER } = Component;
        const cacheKey = containerWidth + CACHE_KEY_DELIMITER +
            containerHeight + CACHE_KEY_DELIMITER +
            originX + CACHE_KEY_DELIMITER +
            originY + CACHE_KEY_DELIMITER +
            this.getCacheKey(lc);
        const cached = this.layoutCache.get(cacheKey);
        if (cached)
            return cached;
        const result = this.layout(lc);
        this.layoutCache.set(cacheKey, result);
        return result;
    }
    static { this.CACHE_KEY_DELIMITER = "_"; }
    /**
     * Generate cache key that ensure cache is same.
     *
     * @returns Cache key
     */
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component;
        return this.x + CACHE_KEY_DELIMITER +
            this.y + CACHE_KEY_DELIMITER +
            this.w + CACHE_KEY_DELIMITER +
            this.h;
    }
    /**
     * Render the component.
     */
    render(ctx) {
        if (this.isAnimating) {
            const currentTime = performance.now();
            if (this.animationStartTime === null) {
                this.animationStartTime = currentTime;
            }
            const duration = this.animationDefaultDurationOverride ||
                Component.ANIMATION_DEFAULT_DURATIONS[this.animationType];
            const deltaT = currentTime - this.animationStartTime;
            const progress = Math.max(0, Math.min(deltaT / duration, 1));
            this.animationProgress =
                this.animationDirection === "in"
                    ? progress
                    : 1 - progress;
            if (deltaT >= duration) {
                if (this.animationDirection === "out") {
                    this.visible = false;
                    // How to fix this error
                    this.emit("onOutAnimationEnd");
                }
                // Fallback to original position
                this.x = this.realX;
                this.y = this.realY;
                this.isAnimating = false;
                this.animationStartTime = null;
            }
        }
        const easingFunction = Component.ANIMATION_EASING_FUNCTIONS[this.animationType]?.[this.animationDirection];
        // This should always be executed regardless of isAnimating
        if (easingFunction) {
            const progress = easingFunction(this.animationProgress);
            switch (this.animationType) {
                case 0 /* AnimationType.ZOOM */: {
                    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                    if (this.animationDirection === "out") {
                        ctx.translate(cx, this.y + (-(1 - progress) * Component.ZOOM_OUT_DEPTH) + this.h / 2);
                    }
                    else {
                        ctx.translate(cx, cy);
                    }
                    ctx.scale(progress, progress);
                    ctx.translate(-cx, -cy);
                    break;
                }
                case 1 /* AnimationType.SLIDE */: {
                    const { animationSlideOffset: offset, animationSlideOffsetSign: offsetSign, animationSlideFadeEffectEnabled: fadeEffectEnabled, x, y, w, h, } = this;
                    // In-out opacity
                    if (fadeEffectEnabled)
                        ctx.globalAlpha = progress;
                    const centerX = x + w / 2, centerY = y + h / 2;
                    if (this.animationSlideDirection === "v") {
                        const slideOffset = offsetSign * (h + offset) * (1 - progress);
                        ctx.translate(centerX, this.realY - slideOffset + h / 2);
                    }
                    else {
                        const slideOffset = offsetSign * (w + offset) * (1 - progress);
                        ctx.translate(this.realX - slideOffset + w / 2, centerY);
                    }
                    ctx.translate(-centerX, -centerY);
                    break;
                }
                case 2 /* AnimationType.FADE */: {
                    // Fade in-out opacity
                    ctx.globalAlpha = progress;
                    break;
                }
                case 3 /* AnimationType.CARD */: {
                    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                    ctx.translate(cx, cy);
                    ctx.rotate(progress * 2 * Math.PI);
                    ctx.scale(progress, progress);
                    ctx.translate(-cx, -cy);
                    break;
                }
            }
        }
        /*
        ctx.save();

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        
        ctx.restore();
        */
    }
    static computePointerLike(p) {
        return p instanceof Function ? p() : p;
    }
    // Both of their value is same, so can just return toggle
    isOpener(toggle, component) {
        return toggle;
    }
    setVisible(toggle, openerOrCloser, shouldAnimate, animationType, animationConfig = {}) {
        if (toggle === this.visible && !this.isAnimating)
            return;
        // Set real visible
        this.desiredVisible = toggle;
        // Set opener/closer
        if (this.isOpener(toggle, openerOrCloser)) {
            this.lastOpener = openerOrCloser;
        }
        else {
            this.lastCloser = openerOrCloser;
        }
        if (this.isAnimating)
            this.isAnimating = false;
        if (shouldAnimate) {
            this.isAnimating = true;
            this.animationType = animationType ?? null;
            this.animationDirection = toggle ? "in" : "out";
            // Setup config for each animation
            if ("defaultDurationOverride" in animationConfig) {
                this.animationDefaultDurationOverride = animationConfig.defaultDurationOverride;
            }
            else {
                this.animationDefaultDurationOverride = null;
            }
            switch (animationType) {
                case 0 /* AnimationType.ZOOM */:
                case 2 /* AnimationType.FADE */:
                case 3 /* AnimationType.CARD */: break;
                case 1 /* AnimationType.SLIDE */: {
                    this.animationSlideDirection =
                        "direction" in animationConfig
                            ? animationConfig.direction
                            : "v";
                    this.animationSlideOffset =
                        "offset" in animationConfig
                            ? animationConfig.offset
                            : Component.SLIDE_DEFAULT_DEPTH_OFFSET;
                    this.animationSlideOffsetSign =
                        "offsetSign" in animationConfig
                            ? animationConfig.offsetSign
                            : 1;
                    this.animationSlideFadeEffectEnabled =
                        "fadeEffectEnabled" in animationConfig
                            ? animationConfig.fadeEffectEnabled
                            : true;
                    break;
                }
            }
            this.animationStartTime = null;
            this.animationProgress = Number(!toggle);
            this.realX = this.x;
            this.realY = this.y;
            if (toggle) {
                this.visible = true;
            }
        }
        else {
            this.visible = toggle;
        }
    }
    /**
     * Reverses the last performed animation.
     */
    revertAnimation(openerOrCloser) {
        if (!this.animationType)
            return;
        const currentState = this.visible;
        // Store the current animation type and config
        const lastAnimationType = this.animationType;
        const lastAnimationConfig = {
            defaultDurationOverride: this.animationDefaultDurationOverride,
            // Last SLIDE animation config if last animation type is slide
            ...(lastAnimationType === 1 /* AnimationType.SLIDE */ && {
                direction: this.animationSlideDirection,
                offset: this.animationSlideOffset,
                offsetSign: this.animationSlideOffsetSign,
                fadeEffectEnabled: this.animationSlideFadeEffectEnabled,
            }),
        };
        // Set visibility with reversed animation
        this.setVisible(!currentState, 
        // Closer
        openerOrCloser, true, lastAnimationType, lastAnimationConfig);
    }
    destroy() {
        // Remove all event listeners from component
        this.removeAllListeners();
        // Remove layout cache
        this.layoutCache.invalidate();
        this.context.removeComponent(this);
        this.context = null;
    }
}
exports.Component = Component;
