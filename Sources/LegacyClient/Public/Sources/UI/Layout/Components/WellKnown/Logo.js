"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGLogo = exports.CanvasLogo = exports.Logo = void 0;
const Layout_1 = __importDefault(require("../../Layout"));
const Component_1 = require("../Component");
const canvg_1 = require("canvg");
class Logo extends Component_1.Component {
    static { _a = Component_1.OBSTRUCTION_AFFECTABLE; }
    constructor(layoutOptions) {
        super();
        this.layoutOptions = layoutOptions;
        this[_a] = false;
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
}
exports.Logo = Logo;
class CanvasLogo extends Logo {
    /**
     * @param drawer - Draw icon at traslated x, y
     */
    constructor(layoutOptions, drawer) {
        super(layoutOptions);
        this.drawer = drawer;
    }
    render(ctx) {
        super.render(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        // Draw logo
        this.drawer(ctx);
        ctx.restore();
    }
}
exports.CanvasLogo = CanvasLogo;
class SVGLogo extends Logo {
    constructor(layoutOptions, svg, sizeCoef = 0.8, rotation = 0) {
        super(layoutOptions);
        this.svg = svg;
        this.sizeCoef = sizeCoef;
        this.rotation = rotation;
        this.svgCanvas = null;
        (async () => {
            this.svgCanvas = new OffscreenCanvas(512, 512);
            const ctx = this.svgCanvas.getContext("2d", {
                antialias: true,
                alpha: true,
            });
            await canvg_1.Canvg.fromString(ctx, this.svg, canvg_1.presets.offscreen()).render();
        })();
    }
    render(ctx) {
        super.render(ctx);
        ctx.save();
        if (this.svgCanvas) {
            const computedSizeCoef = Component_1.Component.computePointerLike(this.sizeCoef);
            const computedRotation = Component_1.Component.computePointerLike(this.rotation);
            const drawWidth = this.w * computedSizeCoef;
            const drawHeight = this.h * computedSizeCoef;
            const centerX = this.x + this.w / 2;
            const centerY = this.y + this.h / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(computedRotation);
            ctx.translate(-centerX, -centerY);
            ctx.drawImage(this.svgCanvas, this.x + (this.w - drawWidth) / 2, this.y + (this.h - drawHeight) / 2, drawWidth, drawHeight);
        }
        ctx.restore();
    }
}
exports.SVGLogo = SVGLogo;
