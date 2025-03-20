import type AbstractUI from "../../UI";
import type { LayoutContext, LayoutResult } from "../Layout";
import LayoutCache from "../LayoutCache";
import type { DynamicLayoutable } from "./ComponentDynamicLayoutable";
import type { Layoutable } from "./ComponentLayoutable";
import type { Button } from "./WellKnown/Button";
import type { AnyStaticContainer, CoordinatedStaticSpace, StaticSpace } from "./WellKnown/Container";
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

export type SetVisibleParameters = UnionToTuple<OverloadParameters<Component["setVisible"]>>;

export type SetVisibleReturnType = UnionToTuple<OverloadReturnType<Component["setVisible"]>>;

export type SetVisibleImplementationParameters = [
    toggle: boolean,
    shouldAnimate: boolean,
    animationType?: AnimationType,
    animationSlideDirection?: AnimationSlideDirection,
];

export const enum AnimationType {
    Zoom,
    Slide,
}

export type AnimationDirection = "in" | "out";

export type AnimationDirectionEasingFunction = Record<AnimationDirection, (x: number) => number>;

export type AnimationSlideDirection = "v" | "h";

/**
 * Render all visible components.
 * 
 * @param components - Components to render
 */
export function renderPossibleComponents(ctx: CanvasRenderingContext2D, components: Iterable<Components>): void {
    for (const component of components) {
        ctx.save();

        component.render(ctx);

        ctx.restore();
    }
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
    Readonly<{
        // Notify event that tell this component is added dynamically to UI
        "onInitialized": [];
    }>
    & typeof INTERACTIVE_EVENTS
    & typeof CLICKABLE_EVENTS;

/**
 * Base Component class for all UI components.
 */
export abstract class Component extends Emitter<ComponentEvents> implements Layoutable {
    protected readonly ANIMATION_ZOOM_DURATION: number = 100;
    protected readonly ANIMATION_SLIDE_DURATION: number = 350;

    protected readonly SLIDE_BASE_DEPTH: number = 20;

    private static readonly ANIMATION_EASING_FUNCTIONS = {
        [AnimationType.Zoom]: {
            in: function easeOutExpo(x: number): number {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            },
            out: function easeInExpo(x: number): number {
                return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
            },
        },
        [AnimationType.Slide]: {
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
     * Cache layout to reduce lags.
     */
    public cachedLayout(lc: LayoutContext): LayoutResult {
        const { containerWidth, containerHeight, originX, originY } = lc;

        const cacheKey = `${containerWidth}${containerHeight}${originX}${originY}` + this.getCacheKey();
        if (!this.layoutCache.isDirtyCache(cacheKey)) {
            const cached = this.layoutCache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const result = this.layout(lc);

        this.layoutCache.set(cacheKey, result);

        return result;
    }

    /**
     * Generate cache key that ensure cache is same.
     * 
     * @returns Cache key
     */
    public getCacheKey(): string {
        return `${this.x}${this.y}${this.w}${this.h}`;
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

            const duration =
                this.animationType === AnimationType.Zoom ? this.ANIMATION_ZOOM_DURATION :
                    this.animationType === AnimationType.Slide ? this.ANIMATION_SLIDE_DURATION :
                        1000;

            const deltaAT = currentTime - this.animationStartTime;
            const progress = Math.max(0, Math.min(deltaAT / duration, 1));

            this.animationProgress = this.animationDirection === "in"
                ? progress
                : 1 - progress;

            if (deltaAT >= duration) {
                if (this.animationDirection === "out") {
                    this.visible = false;
                }

                // Fallback to original position
                this.x = this.realX;
                this.y = this.realY;

                this.isAnimating = false;

                this.animationStartTime = null;
            } else {
                switch (this.animationType) {
                    case AnimationType.Zoom: {
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

        if (
            Component.ANIMATION_EASING_FUNCTIONS.hasOwnProperty(this.animationType) &&
            Component.ANIMATION_EASING_FUNCTIONS[this.animationType].hasOwnProperty(this.animationDirection)
        ) {
            const easingFunction = Component.ANIMATION_EASING_FUNCTIONS[this.animationType][this.animationDirection];

            const progress = easingFunction(this.animationProgress);

            switch (this.animationType) {
                case AnimationType.Zoom: {
                    const cx = this.x + this.w / 2,
                        cy = this.y + this.h / 2;

                    ctx.translate(cx, cy);
                    ctx.scale(progress, progress);
                    ctx.translate(-cx, -cy);

                    break;
                }

                case AnimationType.Slide: {
                    // In-out opacity
                    ctx.globalAlpha = progress;

                    // TODO: option for offset are singed or not
                    if (this.animationSlideDirection === "v") {
                        const slideOffset = -(this.h + this.SLIDE_BASE_DEPTH) * (1 - progress);

                        ctx.translate(this.x + this.w / 2, this.realY - slideOffset + this.h / 2);
                    } else {
                        const slideOffset = (this.w + this.SLIDE_BASE_DEPTH) * (1 - progress);

                        ctx.translate(this.realX - slideOffset + this.w / 2, this.y + this.h / 2);
                    }

                    ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));

                    break;
                }
            }
        }

        ctx.save();

        // ctx.strokeStyle = "blue";
        // ctx.lineWidth = 1;
        // ctx.strokeRect(this.x, this.y, this.w, this.h);

        // ctx.font = "12px Arial";
        // ctx.fillStyle = "black";
        // ctx.textBaseline = "bottom";
        // ctx.fillText(this.constructor.name, this.x, this.y);

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
        animationType: AnimationType.Zoom,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: true,
        animationType: AnimationType.Slide,
        animationSlideDirection: AnimationSlideDirection,
    ): void;
    public setVisible(
        toggle: boolean,
        shouldAnimate: boolean,
        animationType?: AnimationType,
        animationSlideDirection?: AnimationSlideDirection,
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
            this.animationSlideDirection = animationSlideDirection ?? null;
            this.animationStartTime = null;
            this.animationProgress = toggle ? 0 : 1;

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

        this.context.removeComponent(this as unknown as Components);

        this.context = null;
    }
}