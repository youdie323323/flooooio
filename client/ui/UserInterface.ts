import { Biomes } from "../../shared/enum";
import { AllComponents, Clickable, Component, ComponentContainer, Interactive } from "./components/Component";
import { Button } from "./components/Button";
import { DYNAMIC_LAYOUTED } from "./components/extensions/ExtensionDynamicLayoutable";
import { AddableContainer } from "./components/Container";

export let uiScaleFactor: number = 1;

export const UI_BASE_WIDTH = 1300;
export const UI_BASE_HEIGHT = 650;

export default abstract class UserInterface {
    private mouseX: number = 0;
    private mouseY: number = 0;

    private components: AllComponents[] = [];

    // Store children component to not render from UserInterface, flattend
    private childrenComponents: Set<Component> = new Set();

    private hoveredComponent: Interactive | null = null;
    private clickedComponent: Clickable | null = null;

    private _mousedown: (event: MouseEvent) => void;
    private _mouseup: (event: MouseEvent) => void;
    private _mousemove: (event: MouseEvent) => void;

    private _touchmove: (event: TouchEvent) => void;
    private _touchstart: (event: TouchEvent) => void;
    private _touchend: (event: TouchEvent) => void;

    private _keydown: (event: KeyboardEvent) => void;
    private _keyup: (event: KeyboardEvent) => void;

    private _onresize: () => void;

    constructor(protected canvas: HTMLCanvasElement) {
        // Initialize components
        this.initializeComponents();

        this._mousedown = this.handleMouseDown.bind(this);
        this._mouseup = this.handleMouseUp.bind(this);
        this._mousemove = this.handleMouseMove.bind(this);

        this._touchmove = (event: TouchEvent) => {
            event.preventDefault();

            if (!event.isTrusted) return;

            const touch = event.touches[0];

            this.handleMouseMove({
                isTrusted: true,
                clientX: touch.clientX,
                clientY: touch.clientY,
            } as MouseEvent);
        };
        this._touchstart = (event: TouchEvent) => {
            event.preventDefault();

            if (!event.isTrusted) return;

            const touch = event.touches[0];

            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = ((touch.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
            this.mouseY = ((touch.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;

            this.handleMouseDown({ isTrusted: true } as MouseEvent);
        };
        this._touchend = (event: TouchEvent) => {
            event.preventDefault();
            
            if (!event.isTrusted) return;
            
            this.handleMouseUp({ isTrusted: true } as MouseEvent);
        };

        this._keydown = this.handleKeyDown.bind(this);
        this._keyup = this.handleKeyUp.bind(this);

        this._onresize = () => {
            const retinaDisplayScale = devicePixelRatio * 2;

            this.canvas.width = this.canvas.clientWidth * retinaDisplayScale;
            this.canvas.height = this.canvas.clientHeight * retinaDisplayScale;

            uiScaleFactor = Math.max(
                this.canvas.width / UI_BASE_WIDTH,
                this.canvas.height / UI_BASE_HEIGHT
            );

            this.updateComponentsLayout();
        };

        {
            this.canvas.addEventListener('mousedown', this._mousedown);
            this.canvas.addEventListener('mouseup', this._mouseup);
            this.canvas.addEventListener('mousemove', this._mousemove);
        }

        {
            this.canvas.addEventListener('touchmove', this._touchmove);
            this.canvas.addEventListener('touchstart', this._touchstart);
            this.canvas.addEventListener('touchend', this._touchend);
        }

        {
            window.addEventListener('keydown', this._keydown);
            window.addEventListener('keyup', this._keyup);
        }

        // Resize observer cause flash when resizing
        // So ill use primitive methods

        window.addEventListener('resize', this._onresize);

        // Call twice to render container properly
        this._onresize();
        this._onresize();
    }

    public removeEventListeners(): void {
        {
            this.canvas.removeEventListener('mousedown', this._mousedown);
            this.canvas.removeEventListener('mouseup', this._mouseup);
            this.canvas.removeEventListener('mousemove', this._mousemove);
        }

        {
            this.canvas.removeEventListener('touchmove', this._touchmove);
            this.canvas.removeEventListener('touchstart', this._touchstart);
            this.canvas.removeEventListener('touchend', this._touchend);
        }

        {
            window.removeEventListener('keydown', this._keydown);
            window.removeEventListener('keyup', this._keyup);
        }

        window.removeEventListener('resize', this._onresize);

        this._mousedown = null;
        this._mouseup = null;
        this._mousemove = null;
        this._keydown = null;
        this._keyup = null;
    }

    protected addComponent(component: AllComponents): void {
        // Remove component if exists
        this.removeComponent(component);

        this.components.push(component);
    }

    protected removeComponent(component: AllComponents): void {
        const index = this.components.indexOf(component);
        if (index > -1) {
            this.components.splice(index, 1);
        }
    }

    protected addChildrenComponent(targetContainer: ComponentContainer, component: AllComponents): void {
        targetContainer.addChildren(component);

        this.addComponent(component);

        if (!this.childrenComponents.has(component)) {
            this.childrenComponents.add(component);
        }
    }

    protected removeChildrenComponent(targetContainer: ComponentContainer, component: AllComponents): void {
        targetContainer.removeChildren(component);

        this.removeComponent(component);

        this.childrenComponents.delete(component);
    }

    public overlapsComponent(component: Component, x: number, y: number): boolean {
        return x >= component.x && x <= component.x + component.w && y >= component.y && y <= component.y + component.h;
    }

    private isInteractive(component: Component): component is Interactive {
        return "onFocus" in component;
    }

    private isClickable(component: Component): component is Clickable {
        return "onClick" in component;
    }

    private isDynamicLayoutable(component: Component): boolean {
        return DYNAMIC_LAYOUTED in component;
    }

    private getTopLevelComponents(): AllComponents[] {
        return this.components
            .filter(c => !this.childrenComponents.has(c));
    }

    private updateComponentsLayout() {
        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        // Only call top-level invalidateLayoutCache, 
        // container invalidateLayoutCache will invalidate child layout too
        this.getTopLevelComponents().forEach(component => {
            component.invalidateLayoutCache();
        });

        this.getTopLevelComponents().forEach(component => {
            const layout = component._calculateLayout(scaledWidth, scaledHeight, 0, 0);

            component.setX(layout.x);
            component.setY(layout.y);
            component.setW(layout.w);
            component.setH(layout.h);
        });
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

    private isClickableChildren = (component: Component): boolean => !(this.childrenComponents.has(component) && component.parentContainer.isAnimating);

    private handleMouseDown(event: MouseEvent): void {
        if (!event.isTrusted) {
            return;
        }

        this.onMouseDown(event);

        // Click handling
        for (const component of this.components) {
            if (!this.isClickableChildren(component)) {
                continue;
            }

            if (component.visible && this.isClickable(component) && this.overlapsComponent(component, this.mouseX, this.mouseY)) {
                this.clickedComponent = component;
                component.onMouseDown?.();

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
            if (!this.isClickableChildren(this.clickedComponent)) {
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

        // Update mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;

        this.components.forEach(component => {
            if (!this.isClickableChildren(component)) {
                return;
            }

            if (component.visible && this.isInteractive(component)) {
                const isHovering = this.overlapsComponent(component, this.mouseX, this.mouseY);

                if (isHovering) {
                    if (this.hoveredComponent !== component) {
                        this.hoveredComponent?.onBlur?.();
                        this.hoveredComponent = component;
                        component.onFocus?.();
                    }
                } else if (this.hoveredComponent === component) {
                    component.onBlur?.();

                    this.hoveredComponent = null;
                }
            }
        });
    }

    public cleanupRenders(): void {
        this.getTopLevelComponents().forEach(c => {
            c.destroy();
        });

        this.components = [];
        this.components = null;

        this.childrenComponents.clear();
        this.childrenComponents = null;

        this.hoveredComponent = null;
        this.clickedComponent = null;
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.getTopLevelComponents().filter(c => this.isDynamicLayoutable(c)).forEach(component => {
            const layout = component._calculateLayout(scaledWidth, scaledHeight, 0, 0);

            component.setX(layout.x);
            component.setY(layout.y);
            component.setW(layout.w);
            component.setH(layout.h);
        });

        // Render all visible components
        this.getTopLevelComponents().forEach(component => {
            if (component.visible) {
                ctx.save();

                component.render(ctx);

                ctx.restore();
            }
        });
    }


    // Component helpers

    protected createAddableContainer(container: ComponentContainer, children: AllComponents[]): AddableContainer {
        children.forEach(child => {
            this.addChildrenComponent(container, child);

            child.parentContainer = container;
        });

        const addable = container as AddableContainer;
        addable.__addable = true;
        return addable;
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
}