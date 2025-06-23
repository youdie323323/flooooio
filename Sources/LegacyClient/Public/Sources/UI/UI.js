"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_BASE_HEIGHT = exports.UI_BASE_WIDTH = exports.uiScaleFactor = void 0;
const strict_event_emitter_1 = require("strict-event-emitter");
const Component_1 = require("./Layout/Components/Component");
const ExtensionInlineRendering_1 = require("./Layout/Extensions/ExtensionInlineRendering");
const Container_1 = require("./Layout/Components/WellKnown/Container");
exports.uiScaleFactor = 1;
exports.UI_BASE_WIDTH = 1300;
exports.UI_BASE_HEIGHT = 650;
class AbstractUI extends strict_event_emitter_1.Emitter {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        /**
         * Flatten components store.
         */
        this.components = new Set();
        /**
         * Flatten children components store.
         */
        this.childComponents = new Set();
        this.hoveredComponent = null;
        this.clickedComponent = null;
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Cannot get context of canvas");
        }
        this.ctx = ctx;
        this.mousedown = this.handleMouseDown.bind(this);
        this.mouseup = this.handleMouseUp.bind(this);
        this.mousemove = this.handleMouseMove.bind(this);
        this.wheel = this.handleWheel.bind(this);
        this.touchmove = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.handleMouseMove({
                isTrusted: event.isTrusted,
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
        };
        this.touchstart = (event) => {
            event.preventDefault();
            if (event.touches.length > 1)
                return;
            const touch = event.touches[0];
            // Update mouse position first
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = ((touch.clientX - rect.left) * (this.canvas.width / rect.width)) / exports.uiScaleFactor;
            this.mouseY = ((touch.clientY - rect.top) * (this.canvas.height / rect.height)) / exports.uiScaleFactor;
            // Create a synthetic mouse event with the touch coordinates
            this.handleMouseDown({
                isTrusted: event.isTrusted,
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
            });
        };
        this.touchend = (event) => {
            event.preventDefault();
            // Use last known coordinates for the mouseup event
            this.handleMouseUp({
                isTrusted: event.isTrusted,
                clientX: this.mouseX * exports.uiScaleFactor,
                clientY: this.mouseY * exports.uiScaleFactor,
                button: 0,
            });
        };
        this.keydown = this.handleKeyDown.bind(this);
        this.keyup = this.handleKeyUp.bind(this);
        this.onresize = () => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            exports.uiScaleFactor = Math.max(this.canvas.width / exports.UI_BASE_WIDTH, this.canvas.height / exports.UI_BASE_HEIGHT);
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
    removeEventListeners() {
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
    addComponents(...components) {
        components.forEach(component => this.addComponent(component));
    }
    addComponent(component) {
        // Link dynamic values to component
        component.context = this;
        this.components.add(component);
        // Emit initialized
        component.emit("onInitialized");
    }
    removeComponent(component) {
        this.components.delete(component);
    }
    addChildComponent(child) {
        this.addComponent(child);
        this.childComponents.add(child);
    }
    removeChildComponent(child) {
        this.removeComponent(child);
        this.childComponents.delete(child);
    }
    overlapsComponent(targetComponent, x, y) {
        return (x >= targetComponent.x &&
            x <= targetComponent.x + targetComponent.w &&
            y >= targetComponent.y &&
            y <= targetComponent.y + targetComponent.h);
    }
    componentOverlapsComponent({ x: x0, y: y0, w: w0, h: h0 }, { x: x1, y: y1, w: w1, h: h1 }) {
        return !(x0 + w0 <= x1 ||
            x0 >= x1 + w1 ||
            y0 + h0 <= y1 ||
            y0 >= y1 + h1);
    }
    isComponentNotOverlappingWithOtherComponents(targetComponent) {
        for (const component of this.components) {
            if (component === targetComponent)
                continue;
            if (this.isChildComponent(component))
                continue;
            if (this.isComponentAnimatingOut(component))
                continue;
            if (!this.isComponentObstructable(component))
                continue;
            if (this.componentOverlapsComponent(targetComponent, component))
                return false;
        }
        return true;
    }
    isComponentObstructed(targetComponent, x, y) {
        const allComponents = Array.from(this.components);
        const targetIndex = allComponents.indexOf(targetComponent);
        if (targetIndex === -1)
            return false;
        for (let i = targetIndex + 1; i < allComponents.length; i++) {
            const component = allComponents[i];
            if (this.isComponentObstructable(component) &&
                this.overlapsComponent(component, x, y)) {
                return true;
            }
        }
        return false;
    }
    isComponentObstructable({ [Component_1.OBSTRUCTION_AFFECTABLE]: affectable, isRenderable }) {
        return affectable && isRenderable;
    }
    isComponentInteractable(targetComponent) {
        return !this.isAncestorAnimatingOut(targetComponent) &&
            this.isComponentObstructable(targetComponent) &&
            ((0, Component_1.hasInteractiveListeners)(targetComponent) ||
                (0, Component_1.hasClickableListeners)(targetComponent) ||
                (0, Component_1.hasOnScrollListener)(targetComponent));
    }
    isComponentInteractableAtPosition(targetComponent, x, y) {
        return this.isComponentInteractable(targetComponent) &&
            this.overlapsComponent(targetComponent, x, y) &&
            !this.isComponentObstructed(targetComponent, x, y);
    }
    isChildComponent(component) {
        return this.childComponents.has(component);
    }
    getRootComponents() {
        return Array.from(this.components
            .values()
            .filter(c => !this.childComponents.has(c)));
    }
    getTopLevelRenderableComponents() {
        return this.getRootComponents()
            .filter(c => !c[ExtensionInlineRendering_1.BLACKLISTED]);
    }
    updateComponentsLayout(isResized) {
        const scaledWidth = this.canvas.width / exports.uiScaleFactor;
        const scaledHeight = this.canvas.height / exports.uiScaleFactor;
        this.getRootComponents().forEach(component => {
            // Catching the layout on animation can cause big memory wasting
            // if (component.isAnimating) return;
            // Only call top-level invalidateLayoutCache, 
            // container invalidateLayoutCache will invalidate child layout too
            if (isResized)
                component.invalidateLayoutCache();
            if (!component.isLayoutable)
                return;
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
    broadcastUnconditionalEvent(event, ...data) {
        this.emit(event, ...data);
        // We have listener check for event like interactive but these are unconditional, so doesnt need any kind of checks
        this.components.forEach(c => c.emit(event, ...data));
    }
    handleKeyDown(event) {
        if (!event.isTrusted)
            return;
        this.broadcastUnconditionalEvent("onKeyDown", event);
    }
    handleKeyUp(event) {
        if (!event.isTrusted)
            return;
        this.broadcastUnconditionalEvent("onKeyUp", event);
    }
    handleMouseDown(event) {
        if (!event.isTrusted)
            return;
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
                .filter(c => c !== this.clickedComponent &&
                c.lastOpener !== this.clickedComponent &&
                // Not overlap with component
                !this.overlapsComponent(c, mouseX, mouseY) &&
                // Supports outside of container which has static width/height
                !(c instanceof Container_1.AbstractStaticContainer &&
                    this.isComponentDescendant(c, this.clickedComponent)))
                .forEach(c => c.emit("onClickedOutside"));
        }
    }
    handleMouseUp(event) {
        if (!event.isTrusted)
            return;
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
    handleMouseMove(event) {
        if (!event.isTrusted)
            return;
        // Update mouse position
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) * (this.canvas.width / rect.width)) / exports.uiScaleFactor;
        this.mouseY = ((event.clientY - rect.top) * (this.canvas.height / rect.height)) / exports.uiScaleFactor;
        this.broadcastUnconditionalEvent("onMouseMove", event);
        // Maybe too performance impact?
        // this.invalidateDynamicLayoutables();
    }
    handleWheel(event) {
        if (!event.isTrusted)
            return;
        this.broadcastUnconditionalEvent("onWheel", event);
        const { mouseX, mouseY } = this;
        for (const component of this.components) {
            if (this.isComponentInteractableAtPosition(component, mouseX, mouseY)) {
                component.emit("onScroll", event);
                break;
            }
        }
    }
    findParentContainer(child) {
        for (const component of this.components) {
            if (component instanceof Container_1.AbstractStaticContainer &&
                component.hasChild(child))
                return component;
        }
        return null;
    }
    isComponentAnimatingOut({ isAnimating, animationDirection }) {
        return isAnimating && animationDirection === "out";
    }
    isAncestorAnimatingOut(child) {
        const parent = this.findParentContainer(child);
        if (parent === null)
            return false;
        if (this.isComponentAnimatingOut(parent))
            return true;
        return this.isAncestorAnimatingOut(parent);
    }
    isComponentDescendant(container, child) {
        if (container.hasChild(child))
            return true;
        const parent = this.findParentContainer(child);
        if (parent === null)
            return false;
        if (container === parent) {
            return true;
        }
        else {
            return this.isComponentDescendant(container, parent);
        }
    }
    emitInteractiveEvents() {
        if (this.hoveredComponent &&
            this.isAncestorAnimatingOut(this.hoveredComponent)) {
            this.hoveredComponent.emit("onBlur");
            this.hoveredComponent = null;
        }
        this.components.forEach(component => {
            if (
            // Make it only work for component which has interactive listeners
            component[Component_1.OBSTRUCTION_AFFECTABLE] &&
                !this.isAncestorAnimatingOut(component)) {
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
    cleanupComponentHierarchy() {
        this.getRootComponents().forEach(c => c.destroy());
        this.components.clear();
        this.components = null;
        this.childComponents.clear();
        this.childComponents = null;
        this.hoveredComponent = null;
        this.clickedComponent = null;
    }
    renderComponents() {
        this.emitInteractiveEvents();
        this.updateComponentsLayout(false);
        (0, Component_1.renderPossibleComponents)(this.ctx, this.getTopLevelRenderableComponents());
    }
    /**
     * Destory ui-depending values.
     */
    destroy() {
        // Remove all listeners registered
        this.removeAllListeners();
    }
}
exports.default = AbstractUI;
