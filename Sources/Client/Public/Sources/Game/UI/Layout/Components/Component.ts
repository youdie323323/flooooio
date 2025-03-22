import type AbstractUI from "../../UI";
import type { LayoutContext, LayoutResult } from "../Layout";
import LayoutCache from "../LayoutCache";
import type { DynamicLayoutable } from "./ComponentDynamicLayoutable";
import type { Layoutable } from "./ComponentLayoutable";
import type { Button } from "./WellKnown/Button";
import { type AnyStaticContainer, type CoordinatedStaticSpace, type StaticSpace } from "./WellKnown/Container";
import type { CanvasLogo, SVGLogo } from "./WellKnown/Logo";
import type Text from "./WellKnown/Text";
import type TextInput from "./WellKnown/TextInput";
import type Toggle from "./WellKnown/Toggle";
import type { EventMap } from 'strict-event-emitter';
import { Emitter } from 'strict-event-emitter';

/**
 * Dynamic computable pointer-like of T.
 */
export type MaybePointerLike<T> = T | (() => T);

type Satisfies<T extends U, U> = T;

/**
 * Union type that including all components.
 * 
 * @remarks
 * Base components like "Button" is cant addable, not including ("Button" is satisfy Component, its should not work).
 */
export type Components =
    // Well-known components
    | Satisfies<
        | AnyStaticContainer
        | StaticSpace | CoordinatedStaticSpace
        | Button
        | Text
        | TextInput
        | Toggle
        | CanvasLogo | SVGLogo,
        Layoutable
    >
    // UI-native components (like UITitlePlayerProfile)
    | Satisfies<
        InstanceType<abstract new (...args: any[]) => Component & DynamicLayoutable>,
        DynamicLayoutable
    >;

type OverloadProps<Overload> = Pick<Overload, keyof Overload>;

type OverloadUnionRecursive<Overload, PartialOverload = unknown> = Overload extends (
    ...args: infer TArgs
) => infer TReturn
    ?
    // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures
    PartialOverload extends Overload ? never :
    | OverloadUnionRecursive<
        PartialOverload & Overload,
        PartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<Overload>
    >
    | ((...args: TArgs) => TReturn)
    : never;

type OverloadUnion<Overload extends (...args: any[]) => any> = Exclude<
    OverloadUnionRecursive<
        // The "() => never" signature must be hoisted to the "front" of the
        // intersection, for two reasons: a) because recursion stops when it is
        // encountered, and b) it seems to prevent the collapse of subsequent
        // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
        // which gives a direct conversion to a union
        (() => never) & Overload
    >,
    Overload extends () => never ? never : () => never
>;

type UnionToIntersection<U> = (
    U extends any ? (arg: U) => any : never
) extends (arg: infer I) => void
    ? I
    : never;

type UnionToTuple<T> = UnionToIntersection<(T extends any ? (t: T) => T : never)> extends (_: any) => infer W
    ? [...UnionToTuple<Exclude<T, W>>, W]
    : [];

export type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnion<T>>;

export type OverloadReturnType<T extends (...args: any[]) => any> = ReturnType<OverloadUnion<T>>;

export type SetVisibleOverloadParameters = UnionToTuple<OverloadParameters<Component["setVisible"]>>;

export type SetVisibleImplementationParameters = [
    toggle: boolean,
    shouldAnimate: boolean,
    animationType?: AnimationType,
    animationConfig0?: AnimationSlideDirection | number,
];

export const enum AnimationType {
    ZOOM,
    SLIDE,
    FADE,
    CARD,
}

export type AnimationDirection = "in" | "out";

export type AnimationDirectionEasingFunction = Record<AnimationDirection, (x: number) => number>;

export type AnimationSlideDirection = "v" | "h";

export function renderPossibleComponent(ctx: CanvasRenderingContext2D, component: Components): void {
    ctx.save();

    component.render(ctx);

    ctx.restore();
}

/**
 * Render all visible components.
 * 
 * @param components - Components to render
 */
export function renderPossibleComponents(ctx: CanvasRenderingContext2D, components: Iterable<Components>): void {
    for (const component of components) renderPossibleComponent(ctx, component);
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

    "onMouseDown": [],
    "onMouseUp": [],
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

// Typing for EventEmitter
export type ComponentEvents =
    & Readonly<{
        // Event that tell this component is added dynamically to UI
        "onInitialized": [];
    }>
    & Readonly<{
        // Event that tell this component is hide within animation
        "onAnimationHide": [];
    }>
    & typeof INTERACTIVE_EVENTS
    & typeof CLICKABLE_EVENTS;

/**
 * Symbol that affected to obstruction checking.
 */
export const OBSTRUCTION_AFFECTABLE: unique symbol = Symbol("obstructionAffectable");

export interface ComponentSymbol {
    [OBSTRUCTION_AFFECTABLE]?: boolean;
}

/**
 * Base Component class for all UI components.
 */
export abstract class Component<AdheredEvents extends EventMap = EventMap>
    extends Emitter<ComponentEvents & AdheredEvents> implements Layoutable, ComponentSymbol {
    // Prepare base symbols
    public [OBSTRUCTION_AFFECTABLE]: boolean = true;

    protected static readonly ANIMATION_ZOOM_DURATION: number = 100;
    protected static readonly ANIMATION_SLIDE_DURATION: number = 350;
    protected static readonly ANIMATION_CARD_DURATION: number = 750;

    protected static readonly SLIDE_BASE_DEPTH: number = 20;

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

    private static readonly ZOOM_IN_OUT_EASING_FUNCTION = function easeInExpo(x: number): number {
        return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    };

    public isAnimating: boolean = false;

    public animationType: AnimationType | null = null;
    public animationDirection: AnimationDirection | null = null;
    public animationSlideDirection: AnimationSlideDirection | null = null;
    public animationFadeTime: number | null = null;
    public animationStartTime: number | null = null;
    public animationProgress: number = 1;

    /**
     * Component is visible, or not.
     */
    public visible: boolean = true;

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
     * Determine if component will render.
     */
    public get isRenderable(): boolean {
        return this.visible || this.isAnimating;
    }

    /**
     * This method calculate layout by layout options, and parent container/screen.
     */
    public abstract layout(lc: LayoutContext): LayoutResult;

    /**
     * Cached layout to reduce lags.
     */
    public cachedLayout(lc: LayoutContext): LayoutResult {
        const { containerWidth, containerHeight, originX, originY } = lc;

        const { CACHE_KEY_DELIMITER } = Component;

        const cacheKey =
            containerWidth + CACHE_KEY_DELIMITER +
            containerHeight + CACHE_KEY_DELIMITER +
            originX + CACHE_KEY_DELIMITER +
            originY +
            this.getCacheKey(lc);

        if (!this.layoutCache.isDirtyCache(cacheKey)) {
            const cached = this.layoutCache.get(cacheKey);
            if (cached) return cached;
        }

        const result = this.layout(lc);

        this.layoutCache.set(cacheKey, result);

        return result;
    }

    protected static readonly CACHE_KEY_DELIMITER: string = "|";

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
        if (!this.visible && !this.isAnimating) return;

        if (this.isAnimating) {
            const currentTime = performance.now();
            if (this.animationStartTime === null) {
                this.animationStartTime = currentTime;
            }

            let duration: number;
            switch (this.animationType) {
                case AnimationType.ZOOM: {
                    duration = Component.ANIMATION_ZOOM_DURATION;

                    break;
                }

                case AnimationType.SLIDE: {
                    duration = Component.ANIMATION_SLIDE_DURATION;

                    break;
                }

                case AnimationType.FADE: {
                    duration = this.animationFadeTime;

                    break;
                }

                case AnimationType.CARD: {
                    duration = Component.ANIMATION_CARD_DURATION;

                    break;
                }
            }

            const deltaT = currentTime - this.animationStartTime;
            const progress = Math.max(0, Math.min(deltaT / duration, 1));

            this.animationProgress = this.animationDirection === "in"
                ? progress
                : 1 - progress;

            if (deltaT >= duration) {
                if (this.animationDirection === "out") {
                    this.visible = false;

                    // How to fix this error
                    (this.emit as (...args: ReadonlyArray<any>) => {})("onAnimationHide");
                }

                // Fallback to original position
                this.x = this.realX;
                this.y = this.realY;

                this.isAnimating = false;

                this.animationStartTime = null;
            } else {
                switch (this.animationType) {
                    case AnimationType.ZOOM: {
                        if (this.animationZoomShouldSlidePosition) {
                            const inOutProgress = 1 - Component.ZOOM_IN_OUT_EASING_FUNCTION(this.animationProgress);

                            if (this.animationDirection === 'out') {
                                this.y = this.realY - (50 * inOutProgress);
                            } else {
                                this.y = this.realY + (20 * inOutProgress);
                            }
                        }

                        break;
                    }
                }
            }
        }

        // This should always be executed regardless of isAnimating
        if (
            Component.ANIMATION_EASING_FUNCTIONS.hasOwnProperty(this.animationType) &&
            Component.ANIMATION_EASING_FUNCTIONS[this.animationType].hasOwnProperty(this.animationDirection)
        ) {
            const easingFunction = Component.ANIMATION_EASING_FUNCTIONS[this.animationType][this.animationDirection];

            const progress = easingFunction(this.animationProgress);

            switch (this.animationType) {
                case AnimationType.ZOOM: {
                    const cx = this.x + this.w / 2,
                        cy = this.y + this.h / 2;

                    ctx.translate(cx, cy);
                    ctx.scale(progress, progress);
                    ctx.translate(-cx, -cy);

                    break;
                }

                case AnimationType.SLIDE: {
                    // In-out opacity
                    ctx.globalAlpha = progress;

                    // TODO: option for offset are singed or not
                    if (this.animationSlideDirection === "v") {
                        const slideOffset = -(this.h + Component.SLIDE_BASE_DEPTH) * (1 - progress);

                        ctx.translate(this.x + this.w / 2, this.realY - slideOffset + this.h / 2);
                    } else {
                        const slideOffset = (this.w + Component.SLIDE_BASE_DEPTH) * (1 - progress);

                        ctx.translate(this.realX - slideOffset + this.w / 2, this.y + this.h / 2);
                    }

                    ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));

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

        ctx.save();

        // ctx.strokeStyle = "blue";
        // ctx.lineWidth = 1;
        // ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.restore();
    }

    protected static computePointerLike<T>(p: MaybePointerLike<T>): T {
        return p instanceof Function ? p() : p;
    }

    public setVisible(
        toggle: boolean,
        shouldAnimate: false,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: true,
        animationType: AnimationType.ZOOM,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: true,
        animationType: AnimationType.SLIDE,
        animationSlideDirection: AnimationSlideDirection,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: true,
        animationType: AnimationType.FADE,
        animationFadeTime: number,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: true,
        animationType: AnimationType.CARD,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: boolean,
        animationType?: AnimationType,
        animationConfig0?: AnimationSlideDirection | number,
    ): void {
        if (toggle === this.visible && !this.isAnimating) return;

        if (this.isAnimating) {
            this.isAnimating = false;
            this.visible = !toggle;
        }

        if (shouldAnimate) {
            this.isAnimating = true;
            this.animationType = animationType ?? null;
            this.animationDirection = toggle ? "in" : "out";

            // Setup config for each animation

            this.animationSlideDirection = animationConfig0 === "h" || animationConfig0 === "v"
                ? animationConfig0
                : null;

            this.animationFadeTime = typeof animationConfig0 === "number"
                ? animationConfig0
                : null;

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

    public destroy(): void {
        // Remove all event listeners from component
        this.removeAllListeners();

        // Remove layout cache
        this.layoutCache.clear();
        this.layoutCache = null;

        this.context.removeComponent(this as unknown as Components);

        this.context = null;
    }
}