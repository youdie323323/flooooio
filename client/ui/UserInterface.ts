import { Biomes } from "../../shared/biomes";
import { Component } from "./components/Component";
import { ComponentsButton } from "./components/ComponentButton";
import { UserInterfaceManager } from "./UserInterfaceManager";

export default abstract class UserInterface {
    protected canvas: HTMLCanvasElement;
    private mouseX: number = 0;
    private mouseY: number = 0;

    public components: Component[] = [];
    public activeComponent: Component | null = null;

    public biome: Biomes = Biomes.GARDEN;

    private resizeObserver: ResizeObserver | null = null;

    private _mousedown: (event: MouseEvent) => void;
    private _mouseup: (event: MouseEvent) => void;
    private _mousemove: (event: MouseEvent) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setupEventListeners();
        this.initializeComponents();
    }

    private setupEventListeners(): void {
        this._mousedown = this.handleMouseDown.bind(this);
        this._mouseup = this.handleMouseUp.bind(this);
        this._mousemove = this.handleMouseMove.bind(this);

        this.canvas.addEventListener('mousedown', this._mousedown);
        this.canvas.addEventListener('mouseup', this._mouseup);
        this.canvas.addEventListener('mousemove', this._mousemove);

        this.resizeObserver = new ResizeObserver((entries) => {
            const width = Math.round(this.canvas.clientWidth * devicePixelRatio);
            const height = Math.round(this.canvas.clientHeight * devicePixelRatio);
            this.canvas.width = width;
            this.canvas.height = height;

            this.components.forEach(component => {
                component.updateAbsolutePosition(width, height);
            });
        });

        this.resizeObserver.observe(this.canvas);
    }

    public _cleanup(): void {
        // Remove all event listeners
        this.canvas.removeEventListener('mousedown', this._mousedown);
        this.canvas.removeEventListener('mouseup', this._mouseup);
        this.canvas.removeEventListener('mousemove', this._mousemove);

        this._mousedown = null;
        this._mouseup = null;
        this._mousemove = null;

        // Disconnect the ResizeObserver if it exists
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        this.components.forEach(c => c.cleanup());

        this.components = null;
        this.activeComponent = null;
    }

    private updateMousePosition(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
        this.mouseY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    }

    private handleMouseDown(event: MouseEvent): void {
        this.updateMousePosition(event);
        for (const component of this.components) {
            if (component.isPointInside(this.mouseX, this.mouseY)) {
                this.activeComponent = component;
                component.setPressed(true);
                break;
            }
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        this.updateMousePosition(event);
        if (this.activeComponent?.isPointInside(this.mouseX, this.mouseY)) {
            this.activeComponent.executeCallback();
        }
        if (this.activeComponent) {
            this.activeComponent.setPressed(false);
            this.activeComponent = null;
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        this.updateMousePosition(event);
        for (const component of this.components) {
            const isHovering = component.isPointInside(this.mouseX, this.mouseY);
            component.setHovered(isHovering);

            if (this.activeComponent === component && !isHovering) {
                component.setPressed(false);
                this.activeComponent = null;
            }
        }
    }

    protected addComponent(component: Component): void {
        this.components.push(component);
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        for (const component of this.components) {
            component.render(ctx);
        }
    }

    protected abstract initializeComponents(): void;
    public abstract animationFrame(): void;
    public abstract cleanup(): void;
}