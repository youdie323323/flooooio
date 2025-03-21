import type { Biome } from "../../../../../Shared/Biome";
import type { StaticAdherableClientboundHandler } from "../Websocket/Packet/PacketClientbound";
import { type Components, renderPossibleComponents, hasClickableListeners, hasInteractiveListeners, OBSTRUCTION_AFFECTABLE } from "./Layout/Components/Component";
import { type AnyStaticContainer } from "./Layout/Components/WellKnown/Container";
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
    private childComponents: Set<Components> = new Set();

    private hoveredComponent: Components = null;
    private clickedComponent: Components = null;

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
     * Ui-definable client packet bound handler.
     */
    abstract readonly clientboundHandler: StaticAdherableClientboundHandler;

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

            this.updateComponentsLayout(true);
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
            this.hoveredComponent.emit("onBlur");
            this.hoveredComponent = null;
        }
    }

    public addComponents(...components: Array<Components>): void {
        components.forEach(component => this.addComponent(component));
    }

    public addComponent(component: Components): void {
        // Link dynamic values to component

        component.context = this;

        if (!component[BLACKLISTED]) this.components.add(component);

        // Emit initialized
        component.emit("onInitialized");
    }

    public removeComponent(component: Components): void {
        this.components.delete(component);
    }

    public addChildComponent(child: Components): void {
        this.addComponent(child);

        this.childComponents.add(child);
    }

    public removeChildComponent(child: Components): void {
        this.removeComponent(child);

        this.childComponents.delete(child);
    }

    private overlapsComponent(targetComponent: Components, x: number, y: number): boolean {
        return x >= targetComponent.x &&
            x <= targetComponent.x + targetComponent.w &&
            y >= targetComponent.y &&
            y <= targetComponent.y + targetComponent.h;
    }

    private isComponentObstructed(targetComponent: Components, x: number, y: number): boolean {
        const allComponents = Array.from(this.components);

        const targetIndex = allComponents.indexOf(targetComponent);
        if (targetIndex === -1) return false;

        for (let i = targetIndex + 1; i < allComponents.length; i++) {
            const component = allComponents[i];

            if (this.isComponentInteractableWithPosition(component, x, y)) {
                return true;
            }
        }

        return false;
    }

    private isComponentInteractable(targetComponent: Components): boolean {
        return targetComponent[OBSTRUCTION_AFFECTABLE] &&
            (
                hasInteractiveListeners(targetComponent) ||
                hasClickableListeners(targetComponent)
            ) &&
            targetComponent.isRenderable;
    }

    private isComponentInteractableWithPosition(targetComponent: Components, x: number, y: number): boolean {
        return this.isComponentInteractable(targetComponent) &&
            this.overlapsComponent(targetComponent, x, y) &&
            !this.isComponentObstructed(targetComponent, x, y);
    }

    private getTopLevelComponents() {
        return this.components
            .values()
            .filter(c => !this.childComponents.has(c));
    }

    private updateComponentsLayout(isResized: boolean): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.getTopLevelComponents().forEach(component => {
            if (component.isAnimating) return;

            // Only call top-level invalidateLayoutCache, 
            // container invalidateLayoutCache will invalidate child layout too
            if (isResized) component.invalidateLayoutCache();

            const layout = component.cachedLayout({
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
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.isTrusted) return;

        this.onKeyUp(event);
    }

    private handleMouseDown(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.onMouseDown(event);

        // Click handling
        for (const component of this.components) {
            if (this.isComponentInteractableWithPosition(component, this.mouseX, this.mouseY)) {
                this.clickedComponent = component;
                this.clickedComponent.emit("onMouseDown");

                break;
            }
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.onMouseUp(event);

        if (this.clickedComponent) {
            if (this.isComponentInteractableWithPosition(this.clickedComponent, this.mouseX, this.mouseY)) {
                this.clickedComponent.emit("onMouseUp");
                this.clickedComponent.emit("onClick");
            }

            this.clickedComponent = null;
        }
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

    private emitInteractiveEvents(): void {
        this.components.forEach(component => {
            if (
                // Make it only work for component which has interactive listeners
                this.isComponentInteractable(component)
            ) {
                const isHoverable = this.isComponentInteractableWithPosition(component, this.mouseX, this.mouseY);

                if (isHoverable) {
                    if (this.hoveredComponent !== component) {
                        this.hoveredComponent?.emit?.("onBlur");
                        this.hoveredComponent = component;
                        component.emit("onFocus");
                    }
                } else if (
                    // Also !isHovering, previous hoveredComponent is this component and 
                    // if was not hovered, emit onBlur event
                    this.hoveredComponent === component
                ) {
                    component.emit("onBlur");

                    this.hoveredComponent = null;
                }
            }
        });
    }

    public destroyRenderComponents(): void {
        this.getTopLevelComponents().forEach(c => c.destroy());

        this.components.clear();
        this.components = null;

        this.childComponents.clear();
        this.childComponents = null;

        this.hoveredComponent = null;
        this.clickedComponent = null;
    }

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        this.emitInteractiveEvents();

        renderPossibleComponents(ctx, this.getTopLevelComponents());
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