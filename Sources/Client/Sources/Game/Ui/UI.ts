import type { Biome } from "../../../../Shared/Biome";
import type { StaticAdditionalClientboundListen } from "../Websocket/Packet/Bound/Client/PacketClientbound";
import { type Components, type Component, type Interactive, type Clickable, renderPossibleComponents } from "./Layout/Components/Component";
import type { AbstractStaticContainer, AnyAddableStaticContainer, AnyStaticContainer } from "./Layout/Components/WellKnown/Container";
import { DYNAMIC_LAYOUTED } from "./Layout/Extensions/ExtensionDynamicLayoutable";
import { BLACKLISTED } from "./Layout/Extensions/ExtensionInlineRenderingCall";

export let uiScaleFactor: number = 1;

export const UI_BASE_WIDTH = 1300;
export const UI_BASE_HEIGHT = 650;

export default abstract class AbstractUI {
    public mouseX: number = 0;
    public mouseY: number = 0;

    /**
     * Flatten components store.
     */
    private components: Set<Components> = new Set();

    /**
     * Flatten children components store.
     */
    private childrenComponents: Set<Component> = new Set();

    private hoveredComponent: Interactive | null = null;
    private clickedComponent: Clickable | null = null;

    private mousedown: (event: MouseEvent) => void;
    private mouseup: (event: MouseEvent) => void;
    private mousemove: (event: MouseEvent) => void;

    private touchmove: (event: TouchEvent) => void;
    private touchstart: (event: TouchEvent) => void;
    private touchend: (event: TouchEvent) => void;

    private keydown: (event: KeyboardEvent) => void;
    private keyup: (event: KeyboardEvent) => void;

    private onresize: () => void;

    /**
     * Ui-defined packet listen.
     */
    abstract additionalClientboundListen: StaticAdditionalClientboundListen;

    constructor(public canvas: HTMLCanvasElement) {
        // Initialize components
        this.initializeComponents();

        this.mousedown = this.handleMouseDown.bind(this);
        this.mouseup = this.handleMouseUp.bind(this);
        this.mousemove = this.handleMouseMove.bind(this);

        this.touchmove = (event: TouchEvent) => {
            event.preventDefault();

            const touch = event.touches[0];

            this.handleMouseMove(<MouseEvent>{
                isTrusted: event.isTrusted,
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
        };
        this.touchstart = (event: TouchEvent) => {
            event.preventDefault();

            this.handleMouseDown(<MouseEvent>{ isTrusted: event.isTrusted });
        };
        this.touchend = (event: TouchEvent) => {
            event.preventDefault();

            this.handleMouseUp(<MouseEvent>{ isTrusted: event.isTrusted });
        };

        this.keydown = this.handleKeyDown.bind(this);
        this.keyup = this.handleKeyUp.bind(this);

        this.onresize = () => {
            const scale = devicePixelRatio || 1;

            this.canvas.width = this.canvas.clientWidth * scale;
            this.canvas.height = this.canvas.clientHeight * scale;

            uiScaleFactor = Math.max(
                this.canvas.width / UI_BASE_WIDTH,
                this.canvas.height / UI_BASE_HEIGHT,
            );

            this.updateComponentsLayout();
        };

        {
            this.canvas.addEventListener('mousedown', this.mousedown);
            this.canvas.addEventListener('mouseup', this.mouseup);
            this.canvas.addEventListener('mousemove', this.mousemove);
        }

        {
            this.canvas.addEventListener('touchmove', this.touchmove);
            this.canvas.addEventListener('touchstart', this.touchstart);
            this.canvas.addEventListener('touchend', this.touchend);
        }

        {
            window.addEventListener('keydown', this.keydown);
            window.addEventListener('keyup', this.keyup);
        }

        // Resize observer cause flash when resizing
        // So ill use primitive methods

        window.addEventListener('resize', this.onresize);

        // UI Components not working properly without calling this two time
        // Why? :(
        this.onresize();
        this.onresize();
    }

    public removeEventListeners(): void {
        {
            this.canvas.removeEventListener('mousedown', this.mousedown);
            this.canvas.removeEventListener('mouseup', this.mouseup);
            this.canvas.removeEventListener('mousemove', this.mousemove);
        }

        {
            this.canvas.removeEventListener('touchmove', this.touchmove);
            this.canvas.removeEventListener('touchstart', this.touchstart);
            this.canvas.removeEventListener('touchend', this.touchend);
        }

        {
            window.removeEventListener('keydown', this.keydown);
            window.removeEventListener('keyup', this.keyup);
        }

        window.removeEventListener('resize', this.onresize);

        this.mousedown = null;
        this.mouseup = null;
        this.mousemove = null;
        this.keydown = null;
        this.keyup = null;

        // Set cursor style to default if context changed
        if (this.hoveredComponent) {
            this.hoveredComponent.onBlur();
            this.hoveredComponent = null;
        }
    }

    public addComponent(component: Components): Components {
        // Link dynamic values to component

        component.context = this;

        if (!component[BLACKLISTED]) this.components.add(component);

        // Emit initialized
        component.emit("onInitialized");

        return component;
    }

    public removeComponent(component: Components): void {
        const exists = this.components.has(component);
        if (exists) {
            component.destroy();

            this.components.delete(component);
        }
    }

    public addChildrenComponent(targetContainer: AnyStaticContainer, component: Components): void {
        targetContainer.addChildren(component);

        this.addComponent(component);

        this.childrenComponents.add(component);
    }

    public removeChildrenComponent(targetContainer: AnyStaticContainer, component: Components): void {
        targetContainer.removeChildren(component);

        this.removeComponent(component);

        this.childrenComponents.delete(component);
    }

    public overlapsComponent(component: Component, x: number, y: number): boolean {
        return x >= component.x &&
            x <= component.x + component.w &&
            y >= component.y &&
            y <= component.y + component.h;
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

    private getTopLevelComponents() {
        return this.components
            .values()
            .filter(c => !this.childrenComponents.has(c));
    }

    private updateComponentsLayout() {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.getTopLevelComponents().forEach(component => {
            // Only call top-level invalidateLayoutCache, 
            // container invalidateLayoutCache will invalidate child layout too
            component.invalidateLayoutCache();

            const layout = component.cachedCalculateLayout({
                ctx,

                containerWidth: scaledWidth,
                containerHeight: scaledHeight,

                originX: 0,
                originY: 0,
            });

            component.setX(layout.x);
            component.setY(layout.y);
            component.setW(layout.w);
            component.setH(layout.h);
        });
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!event.isTrusted) return;

        this.onKeyDown(event);

        this.invalidateDynamicLayoutables();
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.isTrusted) return;

        this.onKeyUp(event);

        this.invalidateDynamicLayoutables();
    }

    private isClickableChildren = (component: Component): boolean =>
        !(this.childrenComponents.has(component) && component.parentContainer.isAnimating);

    private handleMouseDown(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.onMouseDown(event);

        // Click handling
        for (const component of this.components) {
            if (!this.isClickableChildren(component)) continue;

            if (
                component.visible &&
                this.isClickable(component) &&
                this.overlapsComponent(component, this.mouseX, this.mouseY)
            ) {
                this.clickedComponent = component;
                component.onMouseDown?.();

                break;
            }
        }

        this.invalidateDynamicLayoutables();
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.onMouseUp(event);

        if (this.clickedComponent) {
            if (!this.isClickableChildren(this.clickedComponent)) return;

            if (this.overlapsComponent(this.clickedComponent, this.mouseX, this.mouseY)) {
                this.clickedComponent.onClick?.();
                this.clickedComponent.onMouseUp?.();
            }

            this.clickedComponent = null;
        }

        this.invalidateDynamicLayoutables();
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.onMouseMove(event);

        // Update mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;

        // Maybe too performance impact?
        // this.invalidateDynamicLayoutables();
    }

    private updateComponentFocusStates(): void {
        this.components.forEach(component => {
            if (!this.isClickableChildren(component)) return;

            if (
                component.visible &&
                this.isInteractive(component)
            ) {
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

    public destroyRenderComponents(): void {
        this.getTopLevelComponents().forEach(c => c.destroy());

        this.components.clear();
        this.components = null;

        this.childrenComponents.clear();
        this.childrenComponents = null;

        this.hoveredComponent = null;
        this.clickedComponent = null;
    }

    private getDynamicLayoutables() {
        return this.getTopLevelComponents()
            .filter(c => this.isDynamicLayoutable(c));
    }

    private invalidateDynamicLayoutables(): void {
        this.getDynamicLayoutables().forEach(component => component.invalidateLayoutCache());
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.updateComponentFocusStates();

        this.getDynamicLayoutables().forEach(component => {
            const layout = component.cachedCalculateLayout(
                {
                    ctx,

                    containerWidth: scaledWidth,
                    containerHeight: scaledHeight,

                    originX: 0,
                    originY: 0,
                },
            );

            component.setX(layout.x);
            component.setY(layout.y);
            component.setW(layout.w);
            component.setH(layout.h);
        });

        renderPossibleComponents(ctx, this.getTopLevelComponents());
    }

    public createAddableContainer(
        container: AnyStaticContainer,
        children: Array<Components>,
    ): AnyAddableStaticContainer {
        children.forEach(child => {
            this.addChildrenComponent(container, child);

            child.parentContainer = container;
        });

        const addable = <AnyAddableStaticContainer>container;
        addable.__addable = true;

        return addable;
    }

    // Biome atomic store
    abstract set biome(biome: Biome);
    abstract get biome(): Biome;

    /**
     * Method for initialize components, only called for once.
     */
    protected abstract initializeComponents(): void;

    /**
     * Method call upon every rAF frame.
     */
    public abstract animationFrame(): void;

    /**
     * Destory ui-depending values.
     */
    public abstract destroy(): void;

    /**
     * Method call on ui switched.
     */
    public abstract onContextChanged(): void;

    // Interactive

    // Keyboard
    abstract onKeyDown(event: KeyboardEvent): void;
    abstract onKeyUp(event: KeyboardEvent): void;

    // Mouse
    abstract onMouseDown(event: MouseEvent): void;
    abstract onMouseUp(event: MouseEvent): void;
    abstract onMouseMove(event: MouseEvent): void;
}