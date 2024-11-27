import Layout, { LayoutOptions } from "../layout/Layout";
import { uiScaleFactor } from "../UserInterface";

// Base interface for all GUI components
export abstract class Component {
    private readonly ANIMATION_DURATION: number = 150;
    public isAnimating: boolean = false;
    public animationProgress: number = 1;
    public animationStartTime: number | null = null;
    public animationDirection: 'in' | 'out' = 'in';

    public visible: boolean = true;

    /**
     * Canvas configs.
     */
    private globalAlpha: number = 1;

    private _x: number = 0;
    private _y: number = 0;
    private _w: number = 0;
    private _h: number = 0;

    protected layout: LayoutOptions;

    constructor(layout: LayoutOptions) {
        this.layout = layout;

        this.calculateLayout(window.innerWidth / uiScaleFactor, window.innerHeight / uiScaleFactor);
    }

    public calculateLayout(viewportWidth: number, viewportHeight: number): void {
        const { x, y, w, h } = Layout.calculatePosition(
            this.layout,
            viewportWidth,
            viewportHeight
        );

        this.setX(x);
        this.setY(y);
        this.setW(w);
        this.setH(h);

        this.onLayoutCalculated();
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

        const easeOutCirc = (x: number): number => {
            return Math.sqrt(1 - Math.pow(x - 1, 2));
        };

        const progress = easeOutCirc(this.animationProgress);

        ctx.translate(this.x + this.w / 2, this.y + (-(this.h) * (1 - progress)) + this.h / 2);
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

    public setX(x: number) { this.x = x }
    public setY(y: number) { this.y = y }
    public setW(w: number) { this.w = w }
    public setH(h: number) { this.h = h }

    // Getters and setters
    public get x(): number { return this._x; }
    public set x(value: number) { this._x = value; }

    public get y(): number { return this._y; }
    public set y(value: number) { this._y = value; }

    public get w(): number { return this._w; }
    public set w(value: number) { this._w = value; }

    public get h(): number { return this._h; }
    public set h(value: number) { this._h = value; }

    protected abstract onLayoutCalculated?(): void;
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