import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import LayoutCache from "../layout/LayoutCache";
import UserInterface from "../UserInterface";
import { Button, SVGButton, TextButton } from "./Button";
import { AddableContainer, CoordinatedStaticSpace, StaticSpace } from "./Container";
import { ExtensionConstructor } from "./extensions/Extension";
import PlayerProfile from "./PlayerProfile";
import PlayerXpBar from "./PlayerXpBar";
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
    // Below other than common components
    | PlayerProfile
    | PlayerXpBar;

/**
 * A component is added to components, or not.
 */
export const ADDED = Symbol("added");

/**
 * Symbols describe precomputed semantics of a component, allowing the component to make the base choices for the component.
 */
export interface ComponentSymbol {
    [ADDED]?: boolean;
}

export enum AnimationType {
    ZOOM,
    SLIDE,
}

/**
 * Base interface for all GUI components.
 * 
 * @remarks
 * 
 * Not including dynamic layoutable layout to custom omitable/pickable layout.
 */
export abstract class Component {
    protected readonly ANIMATION_ZOOM_DURATION: number = 150;
    protected readonly ANIMATION_SLIDE_DURATION: number = 500;

    public isAnimating: boolean = false;
    public animationProgress: number = 1;
    public animationStartTime: number | null = null;
    public animationDirection: 'in' | 'out' = 'in';
    public animationType: AnimationType;

    private static readonly ANIMATION_EASING_FUNCTIONS = {
        [AnimationType.ZOOM]: function easeInExpo(x: number): number {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        },
        [AnimationType.SLIDE]: function easeOutExpo(x: number): number {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        },
    };

    /**
     * Real position to store original position to animations.
     */
    private realX: number = 0;
    private realY: number = 0;

    protected layoutCache: LayoutCache = new LayoutCache();

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
    protected globalAlpha: number = 1;

    /**
     * Canvas element.
     */
    public canvas: HTMLCanvasElement;

    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;

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
                this.animationType === AnimationType.ZOOM ? this.ANIMATION_ZOOM_DURATION :
                    this.animationType === AnimationType.SLIDE ? this.ANIMATION_SLIDE_DURATION :
                        1000;

            const elapsed = currentTime - this.animationStartTime;
            let progress = Math.max(0, Math.min(elapsed / duration, 1));
            this.animationProgress = this.animationDirection === 'in' ? progress : 1 - progress;

            if (elapsed >= duration) {
                if (this.animationDirection === 'out') {
                    this.visible = false;
                }

                if (this.animationType === AnimationType.ZOOM) {
                    this.x = this.realX;
                    this.y = this.realY;
                }

                this.isAnimating = false;
                this.animationStartTime = null;
            }
        }

        const easingFunction = Component.ANIMATION_EASING_FUNCTIONS[this.animationType] ?? ((_) => 0);

        const progress = easingFunction(this.animationProgress);

        if (this.animationType === AnimationType.ZOOM) {
            ctx.translate(this.x + this.w / 2, this.y + (1 - progress) + this.h / 2);
            ctx.scale(progress, progress);
            ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
        } else if (this.animationType === AnimationType.SLIDE) {
            // TODO: implement
        }
    }

    public setVisible(
        toggle: boolean,
        shouldAnimate: boolean = false,
        animationType: AnimationType = AnimationType.ZOOM,
    ) {
        if (toggle === this.visible) return;

        if (shouldAnimate) {
            this.isAnimating = true;
            this.animationProgress = toggle ? 0 : 1;
            this.animationStartTime = null;
            this.animationDirection = toggle ? 'in' : 'out';
            this.animationType = animationType;

            this.realX = this.x;
            this.realY = this.y;

            if (this.animationType === AnimationType.ZOOM) {
                this.y += this.animationDirection === "out" ? -20 : 20;
            }

            if (toggle) {
                this.visible = true;
            }
        } else {
            this.visible = toggle;
        }
    }

    public setGlobalAlpha(globalAlpha: number) { this.globalAlpha = globalAlpha }

    public destroy(): void {
        this.canvas = null;
    };

    protected computeDynamicLayoutable<T>(m: MaybeDynamicLayoutablePointer<T>): T {
        return m instanceof Function ? m() : m;
    }

    // Wrap these prop so components can override this method
    public setX(x: number) { this.x = x }
    public setY(y: number) { this.y = y }
    public setW(w: number) { this.w = w }
    public setH(h: number) { this.h = h }
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