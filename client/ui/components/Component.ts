import { scaleFactor } from "../../main";
import Layout, { LayoutOptions } from "../layout/Layout";

// Base interface for all GUI components
export class Component {
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
        ctx.globalAlpha = this.globalAlpha;
    }

    public setVisible(toggle: boolean) {
        this.visible = toggle;
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