import Layout, { LayoutOptions, LayoutResult } from "../layout/Layout";
import LayoutCache from "../layout/LayoutCache";
import { Button, SVGButton, TextButton } from "./Button";
import { AddableContainer, CoordinatedSpace as CoordinatedStaticSpace, StaticSpace } from "./Container";
import PlayerProfile from "./PlayerProfile";
import StaticText from "./Text";
import TextInput from "./TextInput";
import Toggle from "./Toggle";

/**
 * Type that live regenerate value.
 */
export type DynamicLayoutable<T> = T | (() => T);

/**
 * Union type that including all components.
 * 
 * @remarks
 * 
 * Need to create this because of AddableContainer.
 * Although base components like "Button" is cant addable, not including ("Button" is satisfy Component, its should not work) 
 */
export type AllComponents =
    | AddableContainer 
    | StaticSpace | CoordinatedStaticSpace
    | TextButton | SVGButton
    | StaticText
    | TextInput
    | Toggle
    // Below other than common components
    | PlayerProfile;

// Base interface for all GUI components
export abstract class Component {
    protected readonly ANIMATION_DURATION: number = 250;
    public isAnimating: boolean = false;
    public animationProgress: number = 1;
    public animationStartTime: number | null = null;
    public animationDirection: 'in' | 'out' = 'in';

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

    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;

    public layoutCache: LayoutCache = new LayoutCache();

    /**
     * This method calculate layout by layout options, and parent container/screen.
     */
    public abstract calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult;

    public _calculateLayout(
        width: number,
        height: number,
        originX: number,
        originY: number
    ): LayoutResult {
        const cacheKey = `${width+height+originX+originY}` + this.getCacheKey();
        if (!this.layoutCache.isDirtyCache(cacheKey)) {
            const cached = this.layoutCache.get(cacheKey);
            if (cached) {
                return cached;
            };
        };

        const result = this.calculateLayout(width, height, originX, originY);

        console.log("ra")

        this.layoutCache.set(cacheKey, result);

        return result;
    }

    /**
     * Generate cache key that ensure cache is same.
     * @returns Cache key.
     */
    public getCacheKey(): string {
        return `${this.x}${this.y}${this.w}${this.h}${this.globalAlpha}${this.parentContainer ? this.parentContainer.getCacheKey() : ""}`;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.globalAlpha;

        if (!this.visible && !this.isAnimating) {
            return;
        }

        if (this.isAnimating) {
            const currentTime = performance.now();
            if (this.animationStartTime === null) {
                this.animationStartTime = currentTime;
            }

            const elapsed = currentTime - this.animationStartTime;
            let progress = Math.max(0, Math.min(elapsed / this.ANIMATION_DURATION, 1));

            this.animationProgress = this.animationDirection === 'in' ? progress : 1 - progress;

            if (elapsed >= this.ANIMATION_DURATION) {
                if (this.animationDirection === 'out') {
                    this.visible = false;
                }

                this.isAnimating = false;
                this.animationStartTime = null;
            }
        }

        const easeInExpo = (x: number): number => {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        };

        const progress = easeInExpo(this.animationProgress);

        ctx.translate(this.x + this.w / 2, this.y + (-(this.h / 2) * (1 - progress)) + this.h / 2);
        ctx.scale(progress, progress);
        ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
    }

    public setGlobalAlpha(globalAlpha: number) { this.globalAlpha = globalAlpha }

    public setVisible(toggle: boolean, shouldAnimate: boolean = false) {
        if (shouldAnimate) {
            if (toggle === this.visible) return;

            this.isAnimating = true;
            this.animationProgress = toggle ? 0 : 1;
            this.animationStartTime = null;
            this.animationDirection = toggle ? 'in' : 'out';

            if (toggle) {
                this.visible = true;
            }
        } else {
            this.visible = toggle;
        }
    }

    // Wrap these prop so components can override this method
    public setX(x: number) { this.x = x }
    public setY(y: number) { this.y = y }
    public setW(w: number) { this.w = w }
    public setH(h: number) { this.h = h }

    public abstract destroy?(): void;

    protected computeDynamicLayoutable<T>(dl: DynamicLayoutable<T>): T {
        if (dl instanceof Function) {
            return (dl as () => T)();
        } else {
            return dl;
        }
    }
}

// Interface for interactive components
export interface Interactive extends Component {
    onMouseEnter?(): void;
    onMouseLeave?(): void;
}

// Interface for clickable components
export interface Clickable extends Component {
    onClick?(): void;

    // Generic
    onMouseDown?(): void;
    onMouseUp?(): void;
}

// Interface for container components
export interface ComponentContainer extends Component {
    children: AllComponents[];

    addChildren(child: AllComponents): void;
    removeChildren(child: AllComponents): void;
}