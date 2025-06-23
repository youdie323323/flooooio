"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Application_1 = require("../../../../Application");
const Component_1 = require("../Layout/Components/Component");
const UIMobIcon_1 = __importDefault(require("./UIMobIcon"));
class UIDraggableMobIcon extends UIMobIcon_1.default {
    static { this.DRAGGING_SCALE = 1.6; }
    static { this.SCALE_INTERPOLATION_SPEED = 0.1; }
    static { this.WOBBLE_AMPLITUDE = 0.1; }
    static { this.WOBBLE_SPEED = 0.01; }
    constructor(...args) {
        super(...args);
        // Public isDragging to render last on dragging
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.wobbleTime = 0;
        this.currentScale = 1;
        this.on("onDown", () => {
            this.isLayoutable = false;
            this.isDragging = true;
            this.offsetX = this.context.mouseX - this.x;
            this.offsetY = this.context.mouseY - this.y;
            this[Component_1.RENDERED_LAST] = true;
        });
        this.on("onUp", () => {
            this.isLayoutable = true;
            this.isDragging = false;
            this.wobbleTime = 0;
            this[Component_1.RENDERED_LAST] = false;
        });
        this.on("onFocus", () => {
            this.context.canvas.style.cursor = "pointer";
        });
        this.on("onBlur", () => {
            this.context.canvas.style.cursor = "default";
        });
        this.on("onMouseMove", () => {
            if (!this.isDragging)
                return;
            this.setX(this.context.mouseX - this.offsetX);
            this.setY(this.context.mouseY - this.offsetY);
        });
    }
    render(ctx) {
        const targetScale = this.isDragging
            ? UIDraggableMobIcon.DRAGGING_SCALE
            : 1;
        this.currentScale += (targetScale - this.currentScale) * UIDraggableMobIcon.SCALE_INTERPOLATION_SPEED;
        if (this.isDragging) {
            const centerX = this.x + this.w / 2;
            const centerY = this.y + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(this.currentScale, this.currentScale);
            const wobbleAngle = Math.sin(this.wobbleTime * UIDraggableMobIcon.WOBBLE_SPEED) *
                UIDraggableMobIcon.WOBBLE_AMPLITUDE;
            ctx.rotate(wobbleAngle);
            ctx.translate(-centerX, -centerY);
            // Add wobble time
            this.wobbleTime += Application_1.deltaTime;
        }
        super.render(ctx);
    }
}
exports.default = UIDraggableMobIcon;
