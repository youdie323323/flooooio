import { Biomes } from "../../shared/enum";
import { Clickable, Component, Interactive } from "./components/Component";
import { ComponentButton } from "./components/ComponentButton";

export interface BiomeSetter {
    set biome(biome: Biomes);
    get biome(): Biomes;
}

export let uiScaleFactor: number = 1;

export default abstract class UserInterface {
    protected canvas: HTMLCanvasElement;
    private mouseX: number = 0;
    private mouseY: number = 0;

    protected components: Component[] = [];
    private interactiveComponents: Interactive[] = [];

    private hoveredComponent: Interactive | null = null;
    private activeComponent: Clickable | null = null;

    private resizeObserver: ResizeObserver | null = null;

    private _mousedown: (event: MouseEvent) => void;
    private _mouseup: (event: MouseEvent) => void;
    private _mousemove: (event: MouseEvent) => void;
    private _keydown: (event: KeyboardEvent) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setupEventListeners();

        this.initializeComponents();
    }

    protected addComponent(component: Component): void {
        this.components.push(component);

        if (this.isInteractive(component)) {
            this.interactiveComponents.push(component);
        }
    }

    protected removeComponent(component: Component): void {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }

        if (this.isInteractive(component)) {
            const interactiveIndex = this.interactiveComponents.indexOf(component);
            if (interactiveIndex !== -1) {
                this.interactiveComponents.splice(interactiveIndex, 1);
            }
        }
    }

    public overlapsComponent(component: Component, x: number, y: number): boolean {
        return x >= component.x && x <= component.x + component.w && y >= component.y && y <= component.y + component.h;
    }

    private isInteractive(component: Component): component is Interactive {
        return "onMouseEnter" in component;
    }

    private isClickable(component: Component): component is Clickable {
        return "onClick" in component;
    }

    private setupEventListeners(): void {
        this._mousedown = this.handleMouseDown.bind(this);
        this._mouseup = this.handleMouseUp.bind(this);
        this._mousemove = this.handleMouseMove.bind(this);
        this._keydown = this.handleKeyDown.bind(this);

        this.canvas.addEventListener('mousedown', this._mousedown);
        this.canvas.addEventListener('mouseup', this._mouseup);
        this.canvas.addEventListener('mousemove', this._mousemove);
        window.addEventListener('keydown', this._keydown);

        this.resizeObserver = new ResizeObserver((entries) => {
            const width = Math.round(this.canvas.clientWidth * devicePixelRatio);
            const height = Math.round(this.canvas.clientHeight * devicePixelRatio);

            this.canvas.width = width;
            this.canvas.height = height;

            this.components = [];
            this.interactiveComponents = [];

            this.hoveredComponent = null;
            this.activeComponent = null;

            uiScaleFactor = Math.max(
                document.documentElement.clientWidth / 1300,
                document.documentElement.clientHeight / 650
            );

            this.initializeComponents();

            const scaledWidth = width / uiScaleFactor;
            const scaledHeight = height / uiScaleFactor;

            this.components.forEach(component => {
                component.updateAbsolutePosition(scaledWidth, scaledHeight);
            });
        });

        this.resizeObserver.observe(this.canvas);
    }

    private updateMousePosition(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;
    }

    private handleMouseDown(event: MouseEvent): void {
        this.updateMousePosition(event);

        // Click handling
        for (const component of this.interactiveComponents) {
            if (component.visible && this.overlapsComponent(component, this.mouseX, this.mouseY)) {
                if (this.isClickable(component)) {
                    this.activeComponent = component;
                    (component as Clickable).onMouseDown?.();
                }
                break;
            }
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        this.updateMousePosition(event);

        if (this.activeComponent) {
            if (this.overlapsComponent(this.activeComponent, this.mouseX, this.mouseY)) {
                this.activeComponent.onClick?.();
                this.activeComponent.onMouseUp?.();
            }
            this.activeComponent = null;
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        this.updateMousePosition(event);

        this.interactiveComponents.forEach(component => {
            if (component.visible) {
                const isHovering = this.overlapsComponent(component, this.mouseX, this.mouseY);

                if (isHovering) {
                    if (this.hoveredComponent !== component) {
                        this.hoveredComponent?.onMouseLeave?.();
                        this.hoveredComponent = component;
                        component.onMouseEnter?.();
                    }
                } else if (this.hoveredComponent === component) {
                    component.onMouseLeave?.();
                    this.hoveredComponent = null;
                }
            }
        });
    }

    abstract handleKeyDown(event: KeyboardEvent): void;

    public cleanupListeners(): void {
        this.canvas.removeEventListener('mousedown', this._mousedown);
        this.canvas.removeEventListener('mouseup', this._mouseup);
        this.canvas.removeEventListener('mousemove', this._mousemove);
        window.removeEventListener('keydown', this._keydown);

        this._mousedown = null;
        this._mouseup = null;
        this._mousemove = null;
        this._keydown = null;
    }

    public cleanupCore(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        this.components = [];
        this.interactiveComponents = [];
        this.hoveredComponent = null;
        this.activeComponent = null;
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        // Render all visible components
        this.components.forEach(component => {
            if (component.visible) {
                ctx.save();

                component.render(ctx);

                ctx.restore();
            }
        });
    }

    protected abstract initializeComponents(): void;
    public abstract animationFrame(): void;
    public abstract cleanup(): void;
}