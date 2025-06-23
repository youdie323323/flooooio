"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Layout_1 = __importDefault(require("../../Layout"));
const Component_1 = require("../Component");
class Toggle extends Component_1.Component {
    static { this.SCALING_DURATION = 50; }
    constructor(layoutOptions, onToggle) {
        super();
        this.layoutOptions = layoutOptions;
        this.scalingProgress = 0;
        this.scalingStartTime = null;
        this.toggle = false;
        this.on("onFocus", () => {
            this.context.canvas.style.cursor = "pointer";
        });
        this.on("onBlur", () => {
            this.context.canvas.style.cursor = "default";
        });
        this.on("onClick", () => onToggle(!this.toggle));
    }
    layout(lc) {
        return Layout_1.default.layout(Component_1.Component.computePointerLike(this.layoutOptions), lc);
    }
    getCacheKey(lc) {
        const { CACHE_KEY_DELIMITER } = Component_1.Component;
        return super.getCacheKey(lc) +
            CACHE_KEY_DELIMITER +
            Object.values(Component_1.Component.computePointerLike(this.layoutOptions)).join(CACHE_KEY_DELIMITER);
    }
    invalidateLayoutCache() {
        this.layoutCache.invalidate();
    }
    render(ctx) {
        super.render(ctx);
        this.updateScale();
        // Button background
        const strokeWidth = this.getStrokeWidth();
        ctx.save();
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = "#333333";
        ctx.fillStyle = "#666666";
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 0.05);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = this.scalingProgress;
        const rectWidth = this.w - strokeWidth;
        const rectHeight = this.h - strokeWidth;
        const rectX = this.x + (this.w - rectWidth) / 2;
        const rectY = this.y + (this.h - rectHeight) / 2;
        ctx.fillStyle = "#dddddd";
        ctx.beginPath();
        ctx.rect(rectX, rectY, rectWidth, rectHeight);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    getStrokeWidth() {
        return Math.max(2, Math.min(this.w, this.h) * 0.17);
    }
    setToggle(toggle) {
        this.toggle = toggle;
        this.scalingStartTime = performance.now();
        this.scalingProgress = toggle ? 0 : 1;
        return this;
    }
    updateScale() {
        if (this.scalingStartTime === null)
            return;
        const now = performance.now();
        const elapsedTime = now - this.scalingStartTime;
        if (this.toggle) {
            this.scalingProgress = Math.min(elapsedTime / Toggle.SCALING_DURATION, 1);
        }
        else {
            this.scalingProgress = Math.max(1 - (elapsedTime / Toggle.SCALING_DURATION), 0);
        }
        if (this.scalingProgress >= 1 || this.scalingProgress <= 0) {
            this.scalingStartTime = null;
        }
    }
}
exports.default = Toggle;
