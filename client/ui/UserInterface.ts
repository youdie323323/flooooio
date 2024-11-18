import { Biomes } from "../../shared/biomes";
import { Clickable, Component, Focusable, Interactive } from "./components/Component";
import { ComponentButton } from "./components/ComponentButton";

export default abstract class UserInterface {
    protected canvas: HTMLCanvasElement;
    private mouseX: number = 0;
    private mouseY: number = 0;

    protected components: Component[] = [];
    private interactiveComponents: Interactive[] = [];
    private focusableComponents: Focusable[] = [];
    
    private hoveredComponent: Interactive | null = null;
    private focusedComponent: Focusable | null = null;
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
        
        if (this.isFocusable(component)) {
            this.focusableComponents.push(component);
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

        if (this.isFocusable(component)) {
            const focusableIndex = this.focusableComponents.indexOf(component);
            if (focusableIndex !== -1) {
                this.focusableComponents.splice(focusableIndex, 1);
            }
        }
    }

    private isInteractive(component: Component): component is Interactive {
        return 'isPointInside' in component;
    }

    private isFocusable(component: Component): component is Focusable {
        return 'focused' in component;
    }

    private isClickable(component: Component): component is Clickable {
        return 'onClick' in component;
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

            this.components.forEach(component => {
                component.updateAbsolutePosition(width, height);
            });
        });

        this.resizeObserver.observe(this.canvas);
    }

    private updateMousePosition(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
        this.mouseY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    }

    private handleMouseDown(event: MouseEvent): void {
        this.updateMousePosition(event);

        // Focus handling
        let foundFocusable = false;
        for (const component of this.focusableComponents) {
            if (component.visible && component.enabled && 
                component.isPointInside(this.mouseX, this.mouseY)) {
                if (this.focusedComponent && this.focusedComponent !== component) {
                    this.focusedComponent.focused = false;
                    this.focusedComponent.onBlur?.();
                }
                component.focused = true;
                component.onFocus?.();
                this.focusedComponent = component;
                foundFocusable = true;
                break;
            }
        }

        if (!foundFocusable && this.focusedComponent) {
            this.focusedComponent.focused = false;
            this.focusedComponent.onBlur?.();
            this.focusedComponent = null;
        }

        // Click handling
        for (const component of this.interactiveComponents) {
            if (component.visible && component.enabled && 
                component.isPointInside(this.mouseX, this.mouseY)) {
                if (this.isClickable(component)) {
                    this.activeComponent = component;
                    component.onMouseDown?.();
                }
                break;
            }
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        this.updateMousePosition(event);

        if (this.activeComponent?.isPointInside(this.mouseX, this.mouseY)) {
            this.activeComponent.onClick?.();
            this.activeComponent.onMouseUp?.();
        }
        this.activeComponent = null;
    }

    private handleMouseMove(event: MouseEvent): void {
        this.updateMousePosition(event);

        for (const component of this.interactiveComponents) {
            if (component.visible && component.enabled) {
                const isHovering = component.isPointInside(this.mouseX, this.mouseY);
                
                if (isHovering) {
                    if (this.hoveredComponent !== component) {
                        this.hoveredComponent?.onMouseLeave?.();
                        this.hoveredComponent = component;
                        component.onMouseEnter?.();
                    }
                    component.onMouseMove?.(this.mouseX, this.mouseY);
                } else if (this.hoveredComponent === component) {
                    component.onMouseLeave?.();
                    this.hoveredComponent = null;
                }
            }
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (this.focusedComponent) {
            // Handle keyboard events for focused component
            // Implementation depends on specific component requirements
        }
    }

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
        this.focusableComponents = [];
        this.hoveredComponent = null;
        this.focusedComponent = null;
        this.activeComponent = null;
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        // Render all visible components
        for (const component of this.components) {
            if (component.visible) {
                component.render(ctx);
            }
        }
    }

    protected abstract initializeComponents(): void;
    public abstract animationFrame(): void;
    public abstract cleanup(): void;
}