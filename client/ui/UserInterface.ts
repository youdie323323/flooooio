import { Biomes } from "../../shared/enum";
import { Clickable, Component, ComponentContainer, Interactive } from "./components/Component";
import { Button } from "./components/Button";
import { DYNAMIC_LAYOUTED } from "./components/extensions/ExtensionDynamicLayoutable";

export interface BiomeSetter {
    set biome(biome: Biomes);
    get biome(): Biomes;
}

export let uiScaleFactor: number = 1;

export const UI_BASE_WIDTH = 1300;
export const UI_BASE_HEIGHT = 650;

export default abstract class UserInterface {
    private mouseX: number = 0;
    private mouseY: number = 0;

    private components: Component[] = [];

    // Store children component to not render from UserInterface
    private childrenComponents: Set<Component> = new Set();

    private hoveredComponent: Interactive | null = null;
    private clickedComponent: Clickable | null = null;

    // private resizeObserver: ResizeObserver | null = null;

    private _mousedown: (event: MouseEvent) => void;
    private _mouseup: (event: MouseEvent) => void;
    private _mousemove: (event: MouseEvent) => void;
    private _keydown: (event: KeyboardEvent) => void;
    private _keyup: (event: KeyboardEvent) => void;

    private _onresize: () => void;

    constructor(protected canvas: HTMLCanvasElement) {
        // Initialize components
        this.initializeComponents();

        this._mousedown = this.handleMouseDown.bind(this);
        this._mouseup = this.handleMouseUp.bind(this);
        this._mousemove = this.handleMouseMove.bind(this);
        this._keydown = this.handleKeyDown.bind(this);
        this._keyup = this.handleKeyUp.bind(this);

        this.canvas.addEventListener('mousedown', this._mousedown);
        this.canvas.addEventListener('mouseup', this._mouseup);
        this.canvas.addEventListener('mousemove', this._mousemove);
        window.addEventListener('keydown', this._keydown);
        window.addEventListener('keyup', this._keyup);

        // Resize observer cause flash when resizing
        // So ill use primitive methods

        this._onresize = () => {
            const width = Math.round(this.canvas.clientWidth * devicePixelRatio);
            const height = Math.round(this.canvas.clientHeight * devicePixelRatio);

            this.canvas.width = width;
            this.canvas.height = height;

            uiScaleFactor = Math.max(
                document.documentElement.clientWidth / UI_BASE_WIDTH,
                document.documentElement.clientHeight / UI_BASE_HEIGHT
            );

            this.updateComponentsLayout();
        };

        window.addEventListener('resize', this._onresize);

        // Call them first like resize observer
        // Call twice to render container properly
        this._onresize();
        this._onresize();

        /*
        this.resizeObserver = new ResizeObserver((entries) => {
            const width = Math.round(this.canvas.clientWidth * devicePixelRatio);
            const height = Math.round(this.canvas.clientHeight * devicePixelRatio);

            this.canvas.width = width;
            this.canvas.height = height;

            this.regenerateComponents();
        });

        this.resizeObserver.observe(this.canvas);
        */
    }

    protected addComponent(component: Component): void {
        // Remove component if exists
        this.removeComponent(component);

        this.components.push(component);
    }

    protected removeComponent(component: Component): void {
        const index = this.components.indexOf(component);
        if (index > -1) {
            this.components.splice(index, 1);
        }
    }

    protected addChildrenComponent(targetContainer: ComponentContainer, component: Component): void {
        targetContainer.addChildren(component);

        this.addComponent(component);

        if (!this.childrenComponents.has(component)) {
            this.childrenComponents.add(component);
        }
    }

    protected removeChildrenComponent(targetContainer: ComponentContainer, component: Component): void {
        targetContainer.removeChildren(component);

        this.removeComponent(component);

        this.childrenComponents.delete(component);
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

    private isDynamicLayoutable(component: Component): boolean {
        return DYNAMIC_LAYOUTED in component;
    }

    public removeEventListeners(): void {
        /*
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        */

        this.canvas.removeEventListener('mousedown', this._mousedown);
        this.canvas.removeEventListener('mouseup', this._mouseup);
        this.canvas.removeEventListener('mousemove', this._mousemove);
        window.removeEventListener('keydown', this._keydown);
        window.removeEventListener('keyup', this._keyup);

        window.removeEventListener('resize', this._onresize);

        this._mousedown = null;
        this._mouseup = null;
        this._mousemove = null;
        this._keydown = null;
        this._keyup = null;
    }

    private updateComponentsLayout() {
        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.components.forEach(component => {
            if (!this.childrenComponents.has(component)) {
                const layout = component.calculateLayout(scaledWidth, scaledHeight, 0, 0);

                component.setX(layout.x);
                component.setY(layout.y);
                component.setW(layout.w);
                component.setH(layout.h);
            }
        });
    }

    private updateMousePosition(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!event.isTrusted) {
            return;
        }

        this.onKeyDown(event);
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.isTrusted) {
            return;
        }

        this.onKeyUp(event);
    }

    private handleMouseDown(event: MouseEvent): void {
        if (!event.isTrusted) {
            return;
        }

        this.onMouseDown(event);

        // Click handling
        for (const component of this.components) {
            if (!this.interactiveAllowed(component)) {
                continue;
            }

            if (component.visible && this.isClickable(component) && this.overlapsComponent(component, this.mouseX, this.mouseY)) {
                this.clickedComponent = component;
                (component as Clickable).onMouseDown?.();

                break;
            }
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!event.isTrusted) {
            return;
        }

        this.onMouseUp(event);

        if (this.clickedComponent) {
            if (!this.interactiveAllowed(this.clickedComponent)) {
                return;
            }

            if (this.overlapsComponent(this.clickedComponent, this.mouseX, this.mouseY)) {
                this.clickedComponent.onClick?.();
                this.clickedComponent.onMouseUp?.();
            }
            this.clickedComponent = null;
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!event.isTrusted) {
            return;
        }

        this.onMouseMove(event);

        this.updateMousePosition(event);

        this.components.forEach(component => {
            if (!this.interactiveAllowed(component)) {
                return;
            }

            if (component.visible && this.isInteractive(component)) {
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

    private interactiveAllowed(component: Component): boolean {
        if (this.childrenComponents.has(component) && component.parentContainer.isAnimating) {
            return false;
        }

        return true;
    }

    public cleanupRenders(): void {
        this.components.forEach(c => {
            c.destroy();
        });

        this.components = [];

        this.childrenComponents = new Set();

        this.hoveredComponent = null;
        this.clickedComponent = null;
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.components
            .filter(c => !this.childrenComponents.has(c) && this.isDynamicLayoutable(c))
            .forEach(component => {
                // TODO: cache layout to reduce lag                
                const layout = component.calculateLayout(scaledWidth, scaledHeight, 0, 0);

                component.setX(layout.x);
                component.setY(layout.y);
                component.setW(layout.w);
                component.setH(layout.h);
            });

        // Render all visible components
        this.components.forEach(component => {
            if (component.visible && !this.childrenComponents.has(component)) {
                ctx.save();

                component.render(ctx);

                ctx.restore();
            }
        });
    }

    /**
     * Method for initialize components, only called for once.
     */
    protected abstract initializeComponents(): void;
    public abstract animationFrame(): void;
    public abstract cleanup(): void;

    // Interactive

    // Keyboard
    abstract onKeyDown(event: KeyboardEvent): void;
    abstract onKeyUp(event: KeyboardEvent): void;

    // Mouse
    abstract onMouseDown(event: MouseEvent): void;
    abstract onMouseUp(event: MouseEvent): void;
    abstract onMouseMove(event: MouseEvent): void;

    // Component shortener
    protected createContainer<T extends ComponentContainer>(container: T, children: Component[]): T {
        children.forEach(child => {
            this.addChildrenComponent(container, child);

            child.parentContainer = container;
        });

        return container;
    }
}