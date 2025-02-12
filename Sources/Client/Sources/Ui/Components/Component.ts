import { LayoutResult } from "../Layout/Layout";
import LayoutCache from "../Layout/LayoutCache";
import UserInterface from "../UserInterface";
import { SVGButton, TextButton } from "./Button";
import { AddableContainer, CoordinatedStaticSpace, StaticContainer, StaticSpace } from "./Container";
import PlayerProfile from "./PlayerProfile";
import StaticText from "./Text";
import TextInput from "./TextInput";
import Toggle from "./Toggle";

/**
 * Convert type into dynamically type, but its possible to use raw value.
 */
export type MaybeDynamicLayoutablePointer<T> = T | (() => T);

/**
 * Union type that including all components.
 * 
 * @remarks
 * 
 * Base components like "Button" is cant addable, not including ("Button" is satisfy Component, its should not work).
 */
export type AllComponents =
    | AddableContainer
    | StaticSpace | CoordinatedStaticSpace
    | TextButton | SVGButton
    | StaticText
    | TextInput
    | Toggle
    | PlayerProfile;

export enum AnimationType {
    Zoom,
    Slide,
}

type InOutEasingFunction = { in(x: number): number; out(x: number): number };

/**
 * Base interface for all GUI components.
 */
export abstract class Component {
    protected readonly ANIMATION_ZOOM_DURATION: number = 100;
    protected readonly ANIMATION_SLIDE_DURATION: number = 100;

    protected readonly SLIDE_BASE_DEPTH: number = 20;

    private static readonly DEFAULT_EASING_FUNCTIONS = {
        in: () => 0,
        out: () => 0,
    } satisfies InOutEasingFunction;

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
    } satisfies Record<AnimationType, InOutEasingFunction>;

    private static readonly ZOOM_IN_OUT_EASING_FUNCTION = function easeInExpo(x: number): number {
        return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    }

    public isAnimating: boolean = false;
    public animationType: AnimationType;
    public animationProgress: number = 1;
    public animationStartTime: number | null = null;
    public animationDirection: 'in' | 'out' = 'in';
    public animationSlideDirection: "v" | "h";

    /**
     * Should move position while animating zoom animation.
     */
    protected animationZoomShouldMovePosition: boolean = true;

    protected layoutCache: LayoutCache = new LayoutCache();

    public context: UserInterface;

    /**
     * Real position to store original position to animations.
     */
    private realX: number = 0;
    private realY: number = 0;

    /**
     * Component is visible, or not.
     */
    public visible: boolean = true;

    /**
     * Parent container of component.
     */
    public parentContainer: ComponentContainer;

    /**
     * Canvas configs.
     */
    public globalAlpha: number = 1;

    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;

    protected computeDynamicLayoutable<T>(m: MaybeDynamicLayoutablePointer<T>): T {
        return m instanceof Function ? m() : m;
    }

    // Wrap these prop so components can update realX, realY dynamically
    // Although component can override method and can use it
    public setX(x: number) { this.realX = x; this.x = x }
    public setY(y: number) { this.realY = y; this.y = y }
    public setW(w: number) { this.w = w }
    public setH(h: number) { this.h = h }

    /**
     * This method calculate layout by layout options, and parent container/screen.
     */
    public abstract calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult;

    /**
     * Cache layout to reduce lags.
     */
    public _calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        const cacheKey = `${width + height + originX + originY}` + this.getCacheKey();
        if (!this.layoutCache.isDirtyCache(cacheKey)) {
            const cached = this.layoutCache.get(cacheKey);
            if (cached) {
                return cached;
            };
        };

        const result = this.calculateLayout(width, height, originX, originY);

        this.layoutCache.set(cacheKey, result);

        return result;
    }

    /**
     * Generate cache key that ensure cache is same.
     * 
     * @returns Cache key.
     * 
     * @remarks
     * 
     * This should only include layout-affectable values, like "globalAlpha" is not should included, thats not changing x/y/w/h.
     * Also, this doesnt requires separators between values etc, just need to change a little bit.
     */
    public getCacheKey(): string {
        return `${this.x + this.y + this.w + this.h}`;
    }

    /**
     * Method for invalidate cache, this method should invalidate childs too.
     */
    public abstract invalidateLayoutCache(): void;

    public render(ctx: CanvasRenderingContext2D): void {
        // Apply canvas configs
        ctx.globalAlpha = this.globalAlpha;

        if (!this.visible && !this.isAnimating) {
            return;
        }

        if (this.isAnimating) {
            const currentTime = performance.now();
            if (this.animationStartTime === null) {
                this.animationStartTime = currentTime;
            }

            const duration =
                this.animationType === AnimationType.Zoom ? this.ANIMATION_ZOOM_DURATION :
                    this.animationType === AnimationType.Slide ? this.ANIMATION_SLIDE_DURATION :
                        1000;

            const elapsed = currentTime - this.animationStartTime;
            const progress = Math.max(0, Math.min(elapsed / duration, 1));
            this.animationProgress = this.animationDirection === 'in' ? progress : 1 - progress;

            if (elapsed >= duration) {
                if (this.animationDirection === 'out') {
                    this.visible = false;
                }

                this.x = this.realX;
                this.y = this.realY;

                this.isAnimating = false;
                this.animationStartTime = null;
            } else {
                switch (this.animationType) {
                    case AnimationType.Zoom: {
                        if (this.animationZoomShouldMovePosition) {
                            const inOutProgress = 1 - Component.ZOOM_IN_OUT_EASING_FUNCTION(this.animationProgress);

                            if (this.animationDirection === 'out') {
                                this.y = this.realY - (50 * inOutProgress);
                            } else {
                                this.y = this.realY + (30 * inOutProgress);
                            }
                        }

                        break;
                    }
                }
            }
        }

        const easingFunction = (Component.ANIMATION_EASING_FUNCTIONS[this.animationType] ?? Component.DEFAULT_EASING_FUNCTIONS)[this.animationDirection];

        const progress = easingFunction(this.animationProgress);

        switch (this.animationType) {
            case AnimationType.Zoom: {
                ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
                ctx.scale(progress, progress);
                ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));

                break;
            }

            case AnimationType.Slide: {
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

    public destroy(): void {
        this.context = null;
    };

    public setVisible(
        toggle: boolean,
        shouldAnimate: boolean = false,
        animationType: AnimationType = AnimationType.Zoom,
        slideDirection?: "v" | "h",
    ) {
        if (toggle === this.visible) return;

        if (shouldAnimate) {
            this.isAnimating = true;
            this.animationType = animationType;
            this.animationProgress = toggle ? 0 : 1;
            this.animationStartTime = null;
            this.animationDirection = toggle ? 'in' : 'out';
            this.animationSlideDirection = slideDirection;

            this.realX = this.x;
            this.realY = this.y;

            if (toggle) {
                this.visible = true;
            }
        } else {
            this.visible = toggle;
        }
    }
}

// Interface for interactive components
export interface Interactive extends Component {
    onFocus?(): void;
    onBlur?(): void;
}

// Interface for clickable components
export interface Clickable extends Component {
    onClick?(): void;

    onMouseDown?(): void;
    onMouseUp?(): void;
}

// Interface for container components
export interface ComponentContainer extends Component {
    children: AllComponents[];

    addChildren(child: AllComponents): void;
    removeChildren(child: AllComponents): void;
}