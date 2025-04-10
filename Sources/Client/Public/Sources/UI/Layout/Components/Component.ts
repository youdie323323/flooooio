import type AbstractUI from "../../UI";
import type { ComponentCompatibleUnconditionalEvents } from "../../UI";
import type { LayoutContext, LayoutResult } from "../Layout";
import LayoutCache from "../LayoutCache";
import type { DynamicLayoutable } from "./ComponentDynamicLayoutable";
import type { Layoutable } from "./ComponentLayoutable";
import { type AnyStaticContainer, type StaticSpace } from "./WellKnown/Container";
import type Gauge from "./WellKnown/Gauge";
import type { Logo } from "./WellKnown/Logo";
import type Text from "./WellKnown/Text";
import type TextInput from "./WellKnown/TextInput";
import type Toggle from "./WellKnown/Toggle";
import type { EventMap } from 'strict-event-emitter';
import { Emitter } from 'strict-event-emitter';

/**
 * Dynamic computable pointer-like of T.
 */
export type MaybePointerLike<Reference> = Reference | (() => Reference);

type Satisfies<T extends U, U> = T;

/**
 * Union type that including all components.
 */
export type Components =
    // Well-known components
    | Satisfies<
        | AnyStaticContainer
        | StaticSpace
        // CoordinatedStaticSpace extending StaticSpace, so no need to list here
        // | CoordinatedStaticSpace
        // Button extending StaticHContainer, so no need to list here
        // | Button
        | Text
        | TextInput
        | Toggle
        | Logo
        | Gauge,
        // Both of them are extending Logo
        // | CanvasLogo | SVGLogo,
        Layoutable
    >
    // UI-native components (like UITitlePlayerProfile)
    | Satisfies<
        InstanceType<abstract new (...args: ReadonlyArray<any>) => Component & DynamicLayoutable>,
        DynamicLayoutable
    >;

export type ComponentsConstructor = new (...args: ReadonlyArray<any>) => Components;

const observerBrand = Symbol("observerBrand");

declare const openerBrand: unique symbol;
export type ComponentOpener = Components & { [observerBrand]: typeof openerBrand };

declare const closerBrand: unique symbol;
export type ComponentCloser = Components & { [observerBrand]: typeof closerBrand };

/**
 * Fake type to be asserted to toggle value of setVisible first parameter.
 * 
 * @remarks
 * Used to be avoid compilation error.
 * Set visible cant accept "boolean" value because overload are true | false.
 */
export type FakeSetVisibleToggleType = false;

// If toggle is false, this should be ComponentCloser
export type FakeSetVisibleObserverType = ComponentCloser;

type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export const enum AnimationType {
    ZOOM,
    SLIDE,
    FADE,
    CARD,
}

export type AnimationDirection = "in" | "out";

export type AnimationDirectionEasingFunction = Record<AnimationDirection, (x: number) => number>;

export type AnimationSlideDirection = "v" | "h";

interface AnimationConfigBase {
    defaultDurationOverride?: number;
}

export type AnimationConfigs = DeepReadonly<{
    [AnimationType.ZOOM]: AnimationConfigBase;

    [AnimationType.SLIDE]: AnimationConfigBase & {
        direction?: AnimationSlideDirection;
        offset?: number;
        offsetSign?: 1 | -1;
        fadeEffectEnabled?: boolean;
    };

    [AnimationType.FADE]: AnimationConfigBase;

    [AnimationType.CARD]: AnimationConfigBase;
}>;

export type AnimationConfigOf<T extends AnimationType> = AnimationConfigs[T];

export function renderPossibleComponent(ctx: CanvasRenderingContext2D, component: Components): void {
    if (component.isRenderable) {
        ctx.save();

        component.render(ctx);

        ctx.restore();
    }
}

// TODO: this sort the components in the "container" not global, so its not possible to rendered last than other components outside the container
export const sortComponents =
    (components: Array<Components>): Array<Components> =>
        components.toSorted(
            (a: Components, b: Components) => Number(a[RENDERED_LAST]) - Number(b[RENDERED_LAST]),
        );

/**
 * Render all visible components.
 * 
 * @param components - Components to render
 */
export function renderPossibleComponents(ctx: CanvasRenderingContext2D, components: Array<Components>): void {
    for (const component of sortComponents(components)) renderPossibleComponent(ctx, component);
}

const getKeys = <T extends { [key: string]: unknown }>(obj: T): Array<keyof T> => {
    return Object.keys(obj);
};

// Mouse events

const INTERACTIVE_EVENTS = {
    "onFocus": [],
    "onBlur": [],
} as const satisfies EventMap;

const INTERACTIVE_EVENT_NAMES = getKeys(INTERACTIVE_EVENTS);

const CLICKABLE_EVENTS = {
    "onClick": [],

    "onDown": [],
    "onUp": [],
} as const satisfies EventMap;

const CLICKABLE_EVENT_NAMES = getKeys(CLICKABLE_EVENTS);

export function hasInteractiveListeners(component: Components): boolean {
    for (const eventName of INTERACTIVE_EVENT_NAMES) {
        if (component.listenerCount(eventName) > 0) return true;
    }

    return false;
}

export function hasClickableListeners(component: Components): boolean {
    for (const eventName of CLICKABLE_EVENT_NAMES) {
        if (component.listenerCount(eventName) > 0) return true;
    }

    return false;
}

export function hasOnScrollListener(component: Components): boolean {
    return component.listenerCount("onScroll") > 0;
}

// Typing for EventEmitter
export type ComponentEvents<AdheredEvents extends object> =
    Satisfies<
        & {
            // Event that tell this component is added dynamically to UI
            "onInitialized": [];
        }
        & {
            // Event that tell this component is hide within animation
            "onOutAnimationEnd": [];
        }
        & {
            // Event that tell this component is not clicked on mouse up
            "onClickedOutside": [];
        }
        & {
            // Event that tell this component is scrolled
            "onScroll": [event: WheelEvent];
        }
        & typeof INTERACTIVE_EVENTS
        & typeof CLICKABLE_EVENTS
        & ComponentCompatibleUnconditionalEvents,
        EventMap
    >;

/**
 * Symbol that affected to obstruction checking.
 */
export const OBSTRUCTION_AFFECTABLE: unique symbol = Symbol("obstructionAffectable");

/**
 * Symbol that tell UI this component is rendered last.
 */
export const RENDERED_LAST: unique symbol = Symbol("renderedLast");

/**
 * Symbol that tell container should center the child.
 */
export const CENTERING: unique symbol = Symbol("centering");

export interface ComponentSymbol {
    [OBSTRUCTION_AFFECTABLE]?: boolean;
    [RENDERED_LAST]?: boolean;
    [CENTERING]?: boolean;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Base Component class for all UI components.
 */
export abstract class Component<const AdheredEvents extends EventMap = EventMap>
    extends Emitter<ComponentEvents<AdheredEvents>> implements Layoutable, ComponentSymbol {
    // Prepare base symbols
    public [OBSTRUCTION_AFFECTABLE]: boolean = true;
    public [RENDERED_LAST]: boolean = false;
    public [CENTERING]: boolean = false;

    private static readonly ANIMATION_DEFAULT_DURATIONS = {
        [AnimationType.ZOOM]: 200,
        [AnimationType.SLIDE]: 350,
        [AnimationType.FADE]: 1000,
        [AnimationType.CARD]: 750,
    } as const satisfies Record<AnimationType, number>;

    private static readonly ANIMATION_EASING_FUNCTIONS = {
        [AnimationType.ZOOM]: {
            in: function easeOutExpo(x: number): number {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            },
            out: function easeInExpo(x: number): number {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
        [AnimationType.SLIDE]: {
            in: function easeOutExpo(x: number): number {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            },
            out: function easeInExpo(x: number): number {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
        [AnimationType.FADE]: {
            in: function linear(x: number): number {
                return x;
            },
            out: function linear(x: number): number {
                return x;
            },
        },
        [AnimationType.CARD]: {
            in: function easeOutExpo(x: number): number {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            },
            out: function easeInExpo(x: number): number {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
    } as const satisfies Record<AnimationType, AnimationDirectionEasingFunction>;

    private static readonly SLIDE_DEFAULT_DEPTH_OFFSET: number = 20;

    private static readonly ZOOM_OUT_DEPTH: number = 20;

    /**
     * Last component which called this setVisible with toggle true.
     */
    public lastOpener: ComponentOpener;

    /**
     * Last component which called this setVisible with toggle false.
     */
    public lastCloser: ComponentCloser;

    public isAnimating: boolean = false;

    // These are should not null'ed on animation done

    public animationType: AnimationType | null = null;
    public animationDirection: AnimationDirection | null = null;
    public animationProgress: number = 1;

    public animationDefaultDurationOverride: number | null = null;

    public animationSlideDirection: AnimationConfigs[AnimationType.SLIDE]["direction"];
    public animationSlideOffset: AnimationConfigs[AnimationType.SLIDE]["offset"];
    public animationSlideOffsetSign: AnimationConfigs[AnimationType.SLIDE]["offsetSign"];
    public animationSlideFadeEffectEnabled: AnimationConfigs[AnimationType.SLIDE]["fadeEffectEnabled"];

    // These can null'ed on animation done

    public animationStartTime: number | null = null;

    /**
     * Component is visible, or not.
     */
    public visible: boolean = true;

    /**
     * Desired visible.
     * 
     * @remarks
     * Normal visible only set false when animation done, but this will force display the visible.
     */
    public desiredVisible: boolean = true;

    /**
     * Determine if should move position while animating zoom animation.
     */
    protected animationZoomShouldSlidePosition: boolean = true;

    /**
     * Layout cacher.
     */
    protected layoutCache: LayoutCache = new LayoutCache();

    /**
     * Current user-interface mode.
     */
    public context: AbstractUI;

    /**
     * Real position to store original position to animations.
     */
    private realX: number = 0;
    private realY: number = 0;

    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;

    // Wrap these prop so components can update realX, realY dynamically
    // Although component can override method and can use it
    public setX(x: number) { this.realX = x; this.x = x; }

    public setY(y: number) { this.realY = y; this.y = y; }

    public setW(w: number) { this.w = w; }

    public setH(h: number) { this.h = h; }

    /**
     * Determine if this component will render.
     */
    public get isRenderable(): boolean {
        return this.visible || this.isAnimating;
    }

    /**
     * Determine if can this component unvisible within animation.
     */
    public get isOutAnimatable(): boolean {
        return this.visible && !this.isAnimating;
    }

    public accessor isLayoutable: boolean = true;

    /**
     * This method calculate layout by layout options, and parent container/screen.
     */
    public abstract layout(lc: LayoutContext): LayoutResult;

    /**
     * Cached layout method to reduce lags.
     */
    public cachedLayout(lc: LayoutContext): LayoutResult {
        const { containerWidth, containerHeight, originX, originY } = lc;

        const { CACHE_KEY_DELIMITER } = Component;

        const cacheKey =
            containerWidth + CACHE_KEY_DELIMITER +
            containerHeight + CACHE_KEY_DELIMITER +
            originX + CACHE_KEY_DELIMITER +
            originY + CACHE_KEY_DELIMITER +
            this.getCacheKey(lc);

        const cached = this.layoutCache.get(cacheKey);
        if (cached) return cached;

        const result = this.layout(lc);

        this.layoutCache.set(cacheKey, result);

        return result;
    }

    /**
     * Clamp layout result in viewport.
     */
    protected doClamp(lr: LayoutResult): LayoutResult {
        const { width, height } = this.context.canvas;
        const { w, h, x, y } = lr;

        return {
            x: clamp(x, 0, width - w),
            y: clamp(y, 0, height - h),
            
            w,
            h,
        };
    }

    protected static readonly CACHE_KEY_DELIMITER: string = "_";

    /**
     * Generate cache key that ensure cache is same.
     * 
     * @returns Cache key
     */
    public getCacheKey(lc: LayoutContext): string {
        const { CACHE_KEY_DELIMITER } = Component;

        return this.x + CACHE_KEY_DELIMITER +
            this.y + CACHE_KEY_DELIMITER +
            this.w + CACHE_KEY_DELIMITER +
            this.h;
    }

    /**
     * Method for invalidate cache, this method should invalidate childs too.
     */
    public abstract invalidateLayoutCache(): void;

    /**
     * Render the component.
     */
    public render(ctx: CanvasRenderingContext2D): void {
        if (this.isAnimating) {
            const currentTime = performance.now();
            if (this.animationStartTime === null) {
                this.animationStartTime = currentTime;
            }

            const duration: number =
                this.animationDefaultDurationOverride ||
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

        // This should always be executed regardless of isAnimating
        if (
            Component.ANIMATION_EASING_FUNCTIONS[this.animationType]?.[this.animationDirection]
        ) {
            const easingFunction = Component.ANIMATION_EASING_FUNCTIONS[this.animationType][this.animationDirection];

            const progress = easingFunction(this.animationProgress);

            switch (this.animationType) {
                case AnimationType.ZOOM: {
                    const cx = this.x + this.w / 2,
                        cy = this.y + this.h / 2;

                    if (this.animationDirection === "out") {
                        ctx.translate(cx, this.y + (-(1 - progress) * Component.ZOOM_OUT_DEPTH) + this.h / 2);
                    } else {
                        ctx.translate(cx, cy);
                    }

                    ctx.scale(progress, progress);
                    ctx.translate(-cx, -cy);

                    break;
                }

                case AnimationType.SLIDE: {
                    const {
                        animationSlideOffset: offset,
                        animationSlideOffsetSign: offsetSign,
                        animationSlideFadeEffectEnabled: fadeEffectEnabled,
                        x, y, w, h,
                    } = this;

                    // In-out opacity
                    if (fadeEffectEnabled) ctx.globalAlpha = progress;

                    const centerX = x + w / 2,
                        centerY = y + h / 2;

                    if (this.animationSlideDirection === "v") {
                        const slideOffset = offsetSign * (h + offset) * (1 - progress);

                        ctx.translate(centerX, this.realY - slideOffset + h / 2);
                    } else {
                        const slideOffset = offsetSign * (w + offset) * (1 - progress);

                        ctx.translate(this.realX - slideOffset + w / 2, centerY);
                    }

                    ctx.translate(-centerX, -centerY);

                    break;
                }

                case AnimationType.FADE: {
                    // Fade in-out opacity
                    ctx.globalAlpha = progress;

                    break;
                }

                case AnimationType.CARD: {
                    const cx = this.x + this.w / 2,
                        cy = this.y + this.h / 2;

                    ctx.translate(cx, cy);
                    ctx.rotate(progress * Math.PI * 2);
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

    protected static computePointerLike<T>(p: MaybePointerLike<T>): T {
        return p instanceof Function ? p() : p;
    }

    // Both of their value is same, so can just return toggle
    private isOpener(toggle: boolean, component: ComponentOpener | ComponentCloser): component is ComponentOpener {
        return toggle;
    }

    public setVisible(
        toggle: false,
        closer: ComponentCloser,
        shouldAnimate: false,
    ): void;
    public setVisible<T extends AnimationType>(
        toggle: false,
        closer: ComponentCloser,
        shouldAnimate: true,
        animationType: T,
        animationConfig?: AnimationConfigOf<T>,
    ): void;
    public setVisible(
        toggle: true,
        opener: ComponentOpener,
        shouldAnimate: false,
    ): void;
    public setVisible<T extends AnimationType>(
        toggle: true,
        opener: ComponentOpener,
        shouldAnimate: true,
        animationType: T,
        animationConfig?: AnimationConfigOf<T>,
    ): void;
    public setVisible<T extends AnimationType>(
        toggle: boolean,
        openerOrCloser: ComponentOpener | ComponentCloser,
        shouldAnimate: boolean,
        animationType?: T,
        animationConfig: AnimationConfigOf<T> = {},
    ): void {
        if (toggle === this.visible && !this.isAnimating) return;

        // Set real visible
        this.desiredVisible = toggle;

        // Set opener/closer
        if (this.isOpener(toggle, openerOrCloser)) {
            this.lastOpener = openerOrCloser;
        } else {
            this.lastCloser = openerOrCloser;
        }

        if (this.isAnimating) this.isAnimating = false;

        if (shouldAnimate) {
            this.isAnimating = true;
            this.animationType = animationType ?? null;
            this.animationDirection = toggle ? "in" : "out";

            // Setup config for each animation

            if ("defaultDurationOverride" in animationConfig) {
                this.animationDefaultDurationOverride = animationConfig.defaultDurationOverride as number;
            } else {
                this.animationDefaultDurationOverride = null;
            }

            switch (animationType) {
                case AnimationType.ZOOM:
                case AnimationType.FADE:
                case AnimationType.CARD: break;

                case AnimationType.SLIDE: {
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
        } else {
            this.visible = toggle;
        }
    }

    /**
     * Reverses the last performed animation.
     */
    public revertAnimation(openerOrCloser: ComponentOpener | ComponentCloser): void {
        if (!this.animationType) return;

        const currentState = this.visible;

        // Store the current animation type and config
        const lastAnimationType = this.animationType;
        const lastAnimationConfig = {
            defaultDurationOverride: this.animationDefaultDurationOverride,

            // Last SLIDE animation config if last animation type is slide
            ...(lastAnimationType === AnimationType.SLIDE && {
                direction: this.animationSlideDirection,
                offset: this.animationSlideOffset,
                offsetSign: this.animationSlideOffsetSign,
                fadeEffectEnabled: this.animationSlideFadeEffectEnabled,
            }),
        } satisfies AnimationConfigOf<typeof lastAnimationType>;

        // Set visibility with reversed animation
        this.setVisible(
            <FakeSetVisibleToggleType>!currentState,
            // Closer
            <FakeSetVisibleObserverType>openerOrCloser,
            true,
            lastAnimationType,
            lastAnimationConfig,
        );
    }

    public destroy(): void {
        // Remove all event listeners from component
        this.removeAllListeners();

        // Remove layout cache
        this.layoutCache.invalidate();

        this.context.removeComponent(this as unknown as Components);

        this.context = null;
    }
}