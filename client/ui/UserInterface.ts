import { Component } from "./components/Component";
import { ComponentsButton } from "./components/ComponentButton";
import { UserInterfaceManager } from "./UserInterfaceManager";

export default abstract class UserInterface {
    protected uiManager: UserInterfaceManager;
    protected canvas: HTMLCanvasElement;
    private mouseX: number = 0;
    private mouseY: number = 0;

    public components: Component[] = [];
    public activeComponent: Component | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.uiManager = UserInterfaceManager.getInstance(canvas);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        new ResizeObserver((entries) => {
            const width = Math.round(this.canvas.clientWidth * devicePixelRatio);
            const height = Math.round(this.canvas.clientHeight * devicePixelRatio);
            this.canvas.width = width;
            this.canvas.height = height;

            this.components.forEach(component => {
                component.updateAbsolutePosition(width, height);
            });
        }).observe(this.canvas);
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

    public abstract initialize(): void;
    public abstract cleanup(): void;
    protected abstract initializeComponents(): void;
    public abstract animationFrame(callbackFn: () => void): void;
}