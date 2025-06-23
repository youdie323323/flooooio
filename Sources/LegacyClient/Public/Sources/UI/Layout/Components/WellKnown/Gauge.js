"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAUGE_XP_BACKGROUND_COLOR_CODE = void 0;
exports.healthGaugeSources = healthGaugeSources;
exports.xpGaugeSources = xpGaugeSources;
const Layout_1 = __importDefault(require("../../Layout"));
const Component_1 = require("../Component");
const StaticText_1 = require("./StaticText");
class Gauge extends Component_1.Component {
    static { _a = Component_1.OBSTRUCTION_AFFECTABLE; }
    static { this.ANIMATION_SPEED = 0.05; }
    static { this.EPSILON = 1e-10; }
    constructor(layoutOptions, gaugeSources, gaugeWidthPadding = 0, gaugeText = null, gaugeCoef = 0.65, gaugeBackground = "#000000", gaugeTransparent = true) {
        super();
        this.layoutOptions = layoutOptions;
        this.gaugeSources = gaugeSources;
        this.gaugeWidthPadding = gaugeWidthPadding;
        this.gaugeText = gaugeText;
        this.gaugeCoef = gaugeCoef;
        this.gaugeBackground = gaugeBackground;
        this.gaugeTransparent = gaugeTransparent;
        this[_a] = false;
        const computedGaugeSources = Component_1.Component.computePointerLike(this.gaugeSources);
        this.currentValues = new Array(computedGaugeSources.length).fill(0);
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
    calculateOpacity(normalizedValue, threshold = 0.05) {
        if (normalizedValue <= threshold) {
            return normalizedValue / threshold;
        }
        return 1;
    }
    render(ctx) {
        super.render(ctx);
        const computedGaugeSources = Component_1.Component.computePointerLike(this.gaugeSources);
        const computedGaugeWidthPadding = Component_1.Component.computePointerLike(this.gaugeWidthPadding);
        const computedGaugeText = Component_1.Component.computePointerLike(this.gaugeText);
        const computedGaugeBackground = Component_1.Component.computePointerLike(this.gaugeBackground);
        const computedGaugeTransparent = Component_1.Component.computePointerLike(this.gaugeTransparent);
        const computedGaugeCoef = Component_1.Component.computePointerLike(this.gaugeCoef);
        const lineWidth = this.h;
        ctx.translate(this.x, this.y);
        ctx.lineCap = "round";
        if (computedGaugeTransparent)
            ctx.globalAlpha = 0.9;
        const centerHeight = this.h - (lineWidth / 2);
        { // Draw background
            ctx.save();
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = computedGaugeBackground;
            ctx.beginPath();
            ctx.lineTo(0, centerHeight);
            ctx.lineTo(this.w, centerHeight);
            ctx.stroke();
            ctx.restore();
        }
        { // Draw gauge sources
            ctx.save();
            computedGaugeSources.forEach(({ maxValue, thickness, color, lowBehavior }, index) => {
                const currentValue = this.currentValues[index];
                if (currentValue > 0) {
                    const normalizedValue = currentValue / maxValue;
                    ctx.lineWidth = lineWidth * thickness;
                    if (lowBehavior) {
                        if (lowBehavior === "fade") {
                            ctx.globalAlpha = this.calculateOpacity(normalizedValue);
                        }
                        else {
                            ctx.lineWidth = Math.min(ctx.lineWidth, normalizedValue * (lineWidth * 50));
                        }
                    }
                    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.lineTo(computedGaugeWidthPadding, centerHeight);
                    ctx.lineTo(computedGaugeWidthPadding + ((this.w - computedGaugeWidthPadding) * normalizedValue), centerHeight);
                    ctx.stroke();
                }
            });
            ctx.restore();
        }
        // Draw text
        if (computedGaugeText) {
            ctx.save();
            const fontSize = this.h * computedGaugeCoef;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            (0, StaticText_1.setGameFont)(ctx, fontSize);
            const x = (this.w + computedGaugeWidthPadding) / 2, y = this.h / 2;
            ctx.strokeText(computedGaugeText, x, y);
            ctx.fillText(computedGaugeText, x, y);
            ctx.restore();
        }
        { // Interpolate the values
            this.currentValues = this.currentValues.map((current, index) => {
                const { value: target } = computedGaugeSources[index];
                if (current !== target) {
                    const next = current + (target - current) * Gauge.ANIMATION_SPEED;
                    return Math.abs(next) < Gauge.EPSILON
                        ? 0
                        : next;
                }
                return current;
            });
        }
    }
}
exports.default = Gauge;
// Define these as class?
function healthGaugeSources(entity) {
    return () => [
        {
            value: entity.redHealth,
            maxValue: 1,
            thickness: 0.65,
            color: "#f22",
            lowBehavior: "fade",
        },
        {
            value: entity.health,
            maxValue: 1,
            thickness: 0.75,
            color: "#6dd24a",
            lowBehavior: "fade",
        },
    ];
}
exports.GAUGE_XP_BACKGROUND_COLOR_CODE = "#333333";
function xpGaugeSources() {
    return () => [
        {
            value: 14,
            maxValue: 200,
            thickness: 0.8,
            color: "#e4ed61",
            lowBehavior: "fade",
        },
    ];
}
