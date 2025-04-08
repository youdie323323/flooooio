import type { EventMap } from "strict-event-emitter";
import { Emitter } from "strict-event-emitter";
import type { StaticAdheredClientboundHandlers } from "../Websocket/Packet/PacketClientbound";
import { type Components, renderPossibleComponents, OBSTRUCTION_AFFECTABLE, hasClickableListeners, hasInteractiveListeners, hasOnScrollListener } from "./Layout/Components/Component";
import { BLACKLISTED } from "./Layout/Extensions/ExtensionInlineRendering";
import type { AnyStaticContainer } from "./Layout/Components/WellKnown/Container";
import { AbstractStaticContainer } from "./Layout/Components/WellKnown/Container";
import type { Biome } from "../Native/Biome";

export let uiScaleFactor: number = 1;

export const UI_BASE_WIDTH = 1300;
export const UI_BASE_HEIGHT = 650;

type Satisfies<T extends U, U> = T;

export type ComponentCompatibleUnconditionalEvents =
    Satisfies<
        {
            "onKeyDown": [event: KeyboardEvent];
            "onKeyUp": [event: KeyboardEvent];

            "onMouseDown": [event: MouseEvent];
            "onMouseUp": [event: MouseEvent];
            "onMouseMove": [event: MouseEvent];

            "onWheel": [event: WheelEvent];
        },
        EventMap
    >;

export default abstract class AbstractUI extends Emitter<ComponentCompatibleUnconditionalEvents> {
    public ctx: CanvasRenderingContext2D;

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

    protected canvasEventOptions: AddEventListenerOptions;

    protected mousedown: (event: MouseEvent) => void;
    protected mouseup: (event: MouseEvent) => void;
    protected mousemove: (event: MouseEvent) => void;

    protected wheel: (event: WheelEvent) => void;

    protected touchmove: (event: TouchEvent) => void;
    protected touchstart: (event: TouchEvent) => void;
    protected touchend: (event: TouchEvent) => void;

    protected keydown: (event: KeyboardEvent) => void;
    protected keyup: (event: KeyboardEvent) => void;

    protected onresize: () => void;

    /**
     * Store the biome of UI.
     */
    public abstract biome: Biome;

    /**
     * Ui-definable client packet bound handler.
     */
    abstract readonly CLIENTBOUND_HANDLERS: StaticAdheredClientboundHandlers;

    constructor(public canvas: HTMLCanvasElement) {
        super();

        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Cannot get context of canvas");
        }

        this.ctx = ctx;

        this.mousedown = this.handleMouseDown.bind(this);
        this.mouseup = this.handleMouseUp.bind(this);
        this.mousemove = this.handleMouseMove.bind(this);

        this.wheel = this.handleWheel.bind(this);

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
            if (event.touches.length > 1) return;

            const touch = event.touches[0];

            // Update mouse position first
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = ((touch.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
            this.mouseY = ((touch.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;

            // Create a synthetic mouse event with the touch coordinates
            this.handleMouseDown(<MouseEvent>{
                isTrusted: event.isTrusted,
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
            });
        };
        this.touchend = (event: TouchEvent) => {
            event.preventDefault();

            // Use last known coordinates for the mouseup event
            this.handleMouseUp(<MouseEvent>{
                isTrusted: event.isTrusted,
                clientX: this.mouseX * uiScaleFactor,
                clientY: this.mouseY * uiScaleFactor,
                button: 0,
            });
        };

        this.keydown = this.handleKeyDown.bind(this);
        this.keyup = this.handleKeyUp.bind(this);

        this.onresize = () => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            uiScaleFactor = Math.max(
                this.canvas.width / UI_BASE_WIDTH,
                this.canvas.height / UI_BASE_HEIGHT,
            );

            this.updateComponentsLayout(true);
        };

        {
            this.canvasEventOptions = { capture: true };

            const { canvasEventOptions } = this;

            {
                this.canvas.addEventListener("mousedown", this.mousedown, canvasEventOptions);
                this.canvas.addEventListener("mouseup", this.mouseup, canvasEventOptions);
                this.canvas.addEventListener("mousemove", this.mousemove, canvasEventOptions);
            }

            {
                this.canvas.addEventListener("wheel", this.wheel, canvasEventOptions);
            }

            {
                this.canvas.addEventListener("touchmove", this.touchmove, canvasEventOptions);
                this.canvas.addEventListener("touchstart", this.touchstart, canvasEventOptions);
                this.canvas.addEventListener("touchend", this.touchend, canvasEventOptions);
            }
        }

        {
            window.addEventListener("keydown", this.keydown);
            window.addEventListener("keyup", this.keyup);
        }

        // Resize observer cause flash when resizing
        // So ill use primitive methods

        window.addEventListener("resize", this.onresize);

        // Initialize components
        this.onInitialize();

        // Call twice to components working properly
        this.onresize();
        this.onresize();

        // Add touch-action CSS property
        canvas.style.touchAction = "none";
    }

    public removeEventListeners(): void {
        {
            const { canvasEventOptions } = this;

            {
                this.canvas.removeEventListener("mousedown", this.mousedown, canvasEventOptions);
                this.canvas.removeEventListener("mouseup", this.mouseup, canvasEventOptions);
                this.canvas.removeEventListener("mousemove", this.mousemove, canvasEventOptions);
            }

            {
                this.canvas.removeEventListener("wheel", this.wheel, canvasEventOptions);
            }

            {
                this.canvas.removeEventListener("touchmove", this.touchmove, canvasEventOptions);
                this.canvas.removeEventListener("touchstart", this.touchstart, canvasEventOptions);
                this.canvas.removeEventListener("touchend", this.touchend, canvasEventOptions);
            }
        }

        {
            window.removeEventListener("keydown", this.keydown);
            window.removeEventListener("keyup", this.keyup);
        }

        window.removeEventListener("resize", this.onresize);

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

        this.components.add(component);

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
        return (
            x >= targetComponent.x &&
            x <= targetComponent.x + targetComponent.w &&
            y >= targetComponent.y &&
            y <= targetComponent.y + targetComponent.h
        );
    }

    private componentOverlapsComponent(
        { x: x0, y: y0, w: w0, h: h0 }: Components,
        { x: x1, y: y1, w: w1, h: h1 }: Components,
    ): boolean {
        return !(
            x0 + w0 <= x1 ||
            x0 >= x1 + w1 ||
            y0 + h0 <= y1 ||
            y0 >= y1 + h1
        );
    }

    public isComponentNotOverlappingWithOtherComponents(targetComponent: Components): boolean {
        for (const component of this.components) {
            if (component === targetComponent) continue;

            if (this.isChildComponent(component)) continue;

            if (this.isComponentAnimatingOut(component)) continue;

            if (!this.isComponentObstructable(component)) continue;

            if (this.componentOverlapsComponent(targetComponent, component)) return false;
        }

        return true;
    }

    private isComponentObstructed(targetComponent: Components, x: number, y: number): boolean {
        const allComponents = Array.from(this.components);

        const targetIndex = allComponents.indexOf(targetComponent);
        if (targetIndex === -1) return false;

        for (let i = targetIndex + 1; i < allComponents.length; i++) {
            const component = allComponents[i];

            if (
                this.isComponentObstructable(component) &&
                this.overlapsComponent(component, x, y)
            ) {
                return true;
            }
        }

        return false;
    }

    private isComponentObstructable({ [OBSTRUCTION_AFFECTABLE]: affectable, isRenderable }: Components): boolean {
        return affectable && isRenderable;
    }

    private isComponentInteractable(targetComponent: Components): boolean {
        return !this.isAncestorAnimatingOut(targetComponent) &&
            this.isComponentObstructable(targetComponent) &&
            (
                hasInteractiveListeners(targetComponent) ||
                hasClickableListeners(targetComponent) ||
                hasOnScrollListener(targetComponent)
            );
    }

    private isComponentInteractableAtPosition(targetComponent: Components, x: number, y: number): boolean {
        return this.isComponentInteractable(targetComponent) &&
            this.overlapsComponent(targetComponent, x, y) &&
            !this.isComponentObstructed(targetComponent, x, y);
    }

    private isChildComponent(component: Components): boolean {
        return this.childComponents.has(component);
    }

    private getRootComponents(): Array<Components> {
        return Array.from(
            this.components
                .values()
                .filter(c => !this.childComponents.has(c)),
        );
    }

    private getTopLevelRenderableComponents(): Array<Components> {
        return this.getRootComponents()
            .filter(c => !c[BLACKLISTED]);
    }

    private updateComponentsLayout(isResized: boolean): void {
        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.getRootComponents().forEach(component => {
            // Catching the layout on animation can cause big memory wasting
            // if (component.isAnimating) return;

            // Only call top-level invalidateLayoutCache, 
            // container invalidateLayoutCache will invalidate child layout too
            if (isResized) component.invalidateLayoutCache();

            if (!component.isLayoutable) return;

            const layout = component.cachedLayout({
                ctx: this.ctx,

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

    private broadcastUnconditionalEvent(
        event: keyof ComponentCompatibleUnconditionalEvents,
        ...data: ComponentCompatibleUnconditionalEvents[typeof event]
    ): void {
        this.emit(event, ...data);

        // We have listener check for event like interactive but these are unconditional, so doesnt need any kind of checks
        this.components.forEach(c => c.emit(event, ...data));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onKeyDown", event);
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onKeyUp", event);
    }

    private handleMouseDown(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onMouseDown", event);

        if (event.button === 0) {
            // Constant between operations
            const { mouseX, mouseY } = this;

            // Click handling
            for (const component of this.components) {
                if (this.isComponentInteractableAtPosition(component, mouseX, mouseY)) {
                    this.clickedComponent = component;
                    this.clickedComponent.emit("onDown");

                    break;
                }
            }

            // Broadcast onClickOutside event
            // The reason placed this code outside loop is because this should broadcasted when clicked air (nothing)
            this.components.values()
                .filter(
                    c =>
                        c !== this.clickedComponent &&
                        c.lastOpener !== this.clickedComponent &&
                        // Not overlap with component
                        !this.overlapsComponent(c, mouseX, mouseY) &&
                        // Supports outside of container which has static width/height
                        !(
                            c instanceof AbstractStaticContainer &&
                            this.isComponentDescendant(c, this.clickedComponent)
                        ),
                )
                .forEach(c => c.emit("onClickedOutside"));
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onMouseUp", event);

        if (event.button === 0) {
            if (this.clickedComponent) {
                const { mouseX, mouseY } = this;
                if (this.isComponentInteractableAtPosition(this.clickedComponent, mouseX, mouseY)) {
                    this.clickedComponent.emit("onUp");
                    this.clickedComponent.emit("onClick");
                }

                this.clickedComponent = null;
            }
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!event.isTrusted) return;

        // Update mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;

        this.broadcastUnconditionalEvent("onMouseMove", event);

        // Maybe too performance impact?
        // this.invalidateDynamicLayoutables();
    }

    private handleWheel(event: WheelEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onWheel", event);

        const { mouseX, mouseY } = this;
        for (const component of this.components) {
            if (this.isComponentInteractableAtPosition(component, mouseX, mouseY)) {
                component.emit("onScroll", event);

                break;
            }
        }
    }

    private findParentContainer(child: Components): AnyStaticContainer | null {
        for (const component of this.components) {
            if (
                component instanceof AbstractStaticContainer &&
                component.hasChild(child)
            ) return component;
        }

        return null;
    }

    private isComponentAnimatingOut(component: Components): boolean {
        return component.isAnimating && component.animationDirection === "out";
    }

    private isAncestorAnimatingOut(child: Components): boolean {
        const parent = this.findParentContainer(child);

        if (parent === null) return false;

        if (this.isComponentAnimatingOut(parent)) return true;

        return this.isAncestorAnimatingOut(parent);
    }

    private isComponentDescendant(container: AnyStaticContainer, child: Components): boolean {
        if (container.hasChild(child)) return true;

        const parent = this.findParentContainer(child);
        if (parent === null) return false;

        if (container === parent) {
            return true;
        } else {
            return this.isComponentDescendant(container, parent);
        }
    }

    private emitInteractiveEvents(): void {
        if (
            this.hoveredComponent &&
            this.isAncestorAnimatingOut(this.hoveredComponent)
        ) {
            this.hoveredComponent.emit("onBlur");

            this.hoveredComponent = null;
        }

        this.components.forEach(component => {
            if (
                // Make it only work for component which has interactive listeners
                component[OBSTRUCTION_AFFECTABLE] &&
                !this.isAncestorAnimatingOut(component)
            ) {
                const isHovering = this.isComponentInteractableAtPosition(component, this.mouseX, this.mouseY);

                switch (isHovering) {
                    case true: {
                        if (this.hoveredComponent !== component) {
                            this.hoveredComponent?.emit?.("onBlur");

                            this.hoveredComponent = component;
                            this.hoveredComponent.emit("onFocus");
                        }

                        break;
                    }

                    case false: {
                        // If hoveredComponent is this component and not hovered, emit onBlur event
                        if (this.hoveredComponent === component) {
                            this.hoveredComponent.emit("onBlur");

                            this.hoveredComponent = null;
                        }

                        break;
                    }
                }
            }
        });
    }

    public cleanupComponentHierarchy(): void {
        this.getRootComponents().forEach(c => c.destroy());

        this.components.clear();
        this.components = null;

        this.childComponents.clear();
        this.childComponents = null;

        this.hoveredComponent = null;
        this.clickedComponent = null;
    }

    protected renderComponents(): void {
        this.emitInteractiveEvents();

        this.updateComponentsLayout(false);

        renderPossibleComponents(
            this.ctx,
            this.getTopLevelRenderableComponents(),
        );
    }

    /**
     * Method for initialize components, only called for once.
     */
    protected abstract onInitialize(): void;

    /**
     * Method call on ui switched.
     */
    public abstract onContextChange(): void;

    /**
     * Method call upon every rAF frame.
     */
    public abstract render(): void;

    /**
     * Destory ui-depending values.
     */
    public destroy(): void {
        // Remove all listeners registered
        this.removeAllListeners();
    }
}