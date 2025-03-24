import type { EventMap } from "strict-event-emitter";
import { Emitter } from "strict-event-emitter";
import type { Biome } from "../../../../../Shared/Biome";
import type { StaticAdheredClientboundHandlers } from "../Websocket/Packet/PacketClientbound";
import { type Components, renderPossibleComponents, OBSTRUCTION_AFFECTABLE, hasClickableListeners, hasInteractiveListeners } from "./Layout/Components/Component";
import { BLACKLISTED } from "./Layout/Extensions/ExtensionInlineRendering";
import type { AnyStaticContainer } from "./Layout/Components/WellKnown/Container";
import { AbstractStaticContainer } from "./Layout/Components/WellKnown/Container";

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
        },
        EventMap
    >;

export default abstract class AbstractUI extends Emitter<ComponentCompatibleUnconditionalEvents> {
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

    private canvasEventOptions: AddEventListenerOptions;

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
     * Store the biome of UI.
     */
    abstract accessor biome: Biome;

    /**
     * Ui-definable client packet bound handler.
     */
    abstract readonly CLIENTBOUND_HANDLERS: StaticAdheredClientboundHandlers;

    constructor(public canvas: HTMLCanvasElement) {
        super();

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
            this.canvasEventOptions = { capture: true };

            const { canvasEventOptions } = this;

            {
                this.canvas.addEventListener('mousedown', this.mousedown, canvasEventOptions);
                this.canvas.addEventListener('mouseup', this.mouseup, canvasEventOptions);
                this.canvas.addEventListener('mousemove', this.mousemove, canvasEventOptions);
            }

            {
                this.canvas.addEventListener('touchmove', this.touchmove, canvasEventOptions);
                this.canvas.addEventListener('touchstart', this.touchstart, canvasEventOptions);
                this.canvas.addEventListener('touchend', this.touchend, canvasEventOptions);
            }
        }

        {
            window.addEventListener('keydown', this.keydown);
            window.addEventListener('keyup', this.keyup);
        }

        // Resize observer cause flash when resizing
        // So ill use primitive methods

        window.addEventListener('resize', this.onresize);

        // Call twice to components working properly
        this.onresize();
        this.onresize();
    }

    public removeEventListeners(): void {
        {
            const { canvasEventOptions } = this;

            {
                this.canvas.removeEventListener('mousedown', this.mousedown, canvasEventOptions);
                this.canvas.removeEventListener('mouseup', this.mouseup, canvasEventOptions);
                this.canvas.removeEventListener('mousemove', this.mousemove, canvasEventOptions);
            }

            {
                this.canvas.removeEventListener('touchmove', this.touchmove, canvasEventOptions);
                this.canvas.removeEventListener('touchstart', this.touchstart, canvasEventOptions);
                this.canvas.removeEventListener('touchend', this.touchend, canvasEventOptions);
            }
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

            if (
                this.isComponentObstructable(component) &&
                this.overlapsComponent(component, x, y)
            ) {
                return true;
            }
        }

        return false;
    }

    private isComponentObstructable(targetComponent: Components): boolean {
        return targetComponent[OBSTRUCTION_AFFECTABLE] && targetComponent.isRenderable;
    }

    private isComponentInteractable(targetComponent: Components): boolean {
        return this.isComponentObstructable(targetComponent) && (
            hasInteractiveListeners(targetComponent) ||
            hasClickableListeners(targetComponent)
        );
    }

    private isComponentInteractableAtPosition(targetComponent: Components, x: number, y: number): boolean {
        return this.isComponentInteractable(targetComponent) &&
            this.overlapsComponent(targetComponent, x, y) &&
            !this.isComponentObstructed(targetComponent, x, y);
    }

    private getRootComponents() {
        return this.components
            .values()
            .filter(c => !this.childComponents.has(c));
    }

    private getTopLevelRenderableComponents() {
        return this.getRootComponents()
            .filter(c => !c[BLACKLISTED]);
    }

    private updateComponentsLayout(isResized: boolean): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        const scaledWidth = this.canvas.width / uiScaleFactor;
        const scaledHeight = this.canvas.height / uiScaleFactor;

        this.getRootComponents().forEach(component => {
            // Maybe this is good for cached layout but not for now
            // if (component.isAnimating) return;

            // Only call top-level invalidateLayoutCache, 
            // container invalidateLayoutCache will invalidate child layout too
            if (isResized) component.invalidateLayoutCache();

            const layout = component.layout({
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
                        this.isChildDescendant(c, this.clickedComponent)
                    ),
            )
            .forEach(c => c.emit("onClickOutside"));
    }

    private handleMouseUp(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onMouseUp", event);

        if (this.clickedComponent) {
            if (this.isComponentInteractableAtPosition(this.clickedComponent, this.mouseX, this.mouseY)) {
                this.clickedComponent.emit("onUp");
                this.clickedComponent.emit("onClick");
            }

            this.clickedComponent = null;
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!event.isTrusted) return;

        this.broadcastUnconditionalEvent("onMouseMove", event);

        // Update mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / uiScaleFactor;

        // Maybe too performance impact?
        // this.invalidateDynamicLayoutables();
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

    private isAncestorAnimatingOut(child: Components): boolean {
        const parent = this.findParentContainer(child);

        if (parent === null) return false;

        if (parent.isAnimating && parent.animationDirection === "out") return true;

        return this.isAncestorAnimatingOut(parent);
    }

    private isChildDescendant(container: AnyStaticContainer, child: Components): boolean {
        if (container.hasChild(child)) return true;

        const parent = this.findParentContainer(child);
        if (parent === null) return false;

        if (container === parent) {
            return true;
        } else {
            return this.isChildDescendant(container, parent);
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

    protected render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) return;

        this.emitInteractiveEvents();

        this.updateComponentsLayout(false);

        renderPossibleComponents(
            ctx,
            this.getTopLevelRenderableComponents(),
        );

        /*
        this.components.forEach(c => {
            ctx.save();

            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.strokeRect(c.x, c.y, c.w, c.h);

            ctx.restore();
        }); 
        */
    }

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
    public destroy(): void {
        // Remove all listeners registered
        this.removeAllListeners();
    }

    /**
     * Method call on ui switched.
     */
    public abstract onContextChanged(): void;
}