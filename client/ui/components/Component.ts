import { scaleFactor } from "../../main";
import Layout, { LayoutOptions } from "../layout/Layout";

// Base interface for all GUI components
export class Component {
    private readonly ANIMATION_DURATION: number = 300;
    private isAnimating: boolean = false;
    private animationProgress: number = 1;
    private animationStartTime: number | null = null;
    private animationDirection: 'in' | 'out';

    public visible: boolean = true;

    /**
     * Canvas configs.
     */
    private globalAlpha: number = 1;

    protected _x: number = 0;
    protected _y: number = 0;
    protected _w: number = 0;
    protected _h: number = 0;

    protected layout: LayoutOptions;

    constructor(layout: LayoutOptions) {
        this.layout = layout;

        this.isAnimating = true;
        this.animationDirection = 'in';
        this.animationProgress = 0;
        this.animationStartTime = null;

        this.updateAbsolutePosition(window.innerWidth / scaleFactor, window.innerHeight / scaleFactor);
    }

    public updateAbsolutePosition(viewportWidth: number, viewportHeight: number): void {
        const { x, y, width, height } = Layout.calculatePosition(
            this.layout,
            viewportWidth,
            viewportHeight
        );

        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible && !this.isAnimating) {
            return;
        }

        ctx.globalAlpha = this.globalAlpha;

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

        const easeOutExpo = (x: number): number => {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        };

        const progress = easeOutExpo(this.animationProgress);

        ctx.translate(this.x + this.w / 2, this.y + (-(this.h / 2) * (1 - progress)) + this.h / 2);
        ctx.scale(progress, progress);
        ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
    }

    public setVisible(toggle: boolean) {
        if (toggle === this.visible) return;

        this.isAnimating = true;
        this.animationProgress = toggle ? 0 : 1;
        this.animationStartTime = null;
        this.animationDirection = toggle ? 'in' : 'out';

        if (toggle) {
            this.visible = true;
        }
    }

    public setGlobalAlpha(globalAlpha: number) {
        this.globalAlpha = globalAlpha;
    }

    // Getters and setters for x, y, w, h
    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    public get w(): number {
        return this._w;
    }

    public set w(value: number) {
        this._w = value;
    }

    public get h(): number {
        return this._h;
    }

    public set h(value: number) {
        this._h = value;
    }
}

// Interface for interactive components
export interface Interactive extends Component {
    isPointInside(x: number, y: number): boolean;
    onMouseEnter?(): void;
    onMouseLeave?(): void;
    onMouseMove?(x: number, y: number): void;
}

// Interface for clickable components
export interface Clickable extends Interactive {
    onClick?(): void;
    onMouseDown?(): void;
    onMouseUp?(): void;
}

// Interface for components that can be focused
export interface Focusable extends Interactive {
    focused: boolean;
    onFocus?(): void;
    onBlur?(): void;
}