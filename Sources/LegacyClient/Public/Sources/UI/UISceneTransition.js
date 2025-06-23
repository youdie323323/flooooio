"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UI_1 = require("./UI");
const UITitle_1 = __importDefault(require("./Title/UITitle"));
const TAU = 2 * Math.PI;
class UISceneTransition {
    static { this.STROKE_WIDTH = 5; }
    static { this.STROKE_COLOR = "#000000"; }
    static { this.TRANSITION_CONFIGS = {
        title: {
            initialRadius: (canvas) => Math.max(((canvas.height / UI_1.uiScaleFactor) / 2) + 100, ((canvas.width / UI_1.uiScaleFactor) / 2) + 100),
            radiusChange: (current) => current - (0.3 + current / 40),
            isComplete: (_, radius) => radius < 0,
        },
        game: {
            initialRadius: () => 0,
            radiusChange: (current) => current + (0.2 + current / 35),
            isComplete: (canvas, radius) => radius > Math.max(((canvas.height / UI_1.uiScaleFactor) / 2) + 100, ((canvas.width / UI_1.uiScaleFactor) / 2) + 100),
        },
    }; }
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = -1;
    }
    start(type) {
        const config = UISceneTransition.TRANSITION_CONFIGS[type];
        this.radius = config.initialRadius(this.canvas);
    }
    update(type) {
        const config = UISceneTransition.TRANSITION_CONFIGS[type];
        this.radius = config.radiusChange(this.radius);
        return config.isComplete(this.canvas, this.radius);
    }
    draw(currentUI, previousUI) {
        // Determine in or out
        const [innerUI, outerUI] = currentUI instanceof UITitle_1.default
            ? [currentUI, previousUI]
            : [previousUI, currentUI];
        innerUI?.render();
        this.ctx.save();
        this.clipCircle();
        outerUI?.render();
        this.ctx.restore();
        this.drawTransitionBorder();
    }
    clipCircle() {
        const widthRelative = this.canvas.width / UI_1.uiScaleFactor;
        const heightRelative = this.canvas.height / UI_1.uiScaleFactor;
        this.ctx.beginPath();
        this.ctx.arc(widthRelative / 2, heightRelative / 2, this.radius, 0, TAU);
        this.ctx.clip("evenodd");
    }
    drawTransitionBorder() {
        const widthRelative = this.canvas.width / UI_1.uiScaleFactor;
        const heightRelative = this.canvas.height / UI_1.uiScaleFactor;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(widthRelative / 2, heightRelative / 2, this.radius, 0, TAU);
        this.ctx.lineWidth = UISceneTransition.STROKE_WIDTH;
        this.ctx.strokeStyle = UISceneTransition.STROKE_COLOR;
        this.ctx.stroke();
        this.ctx.restore();
    }
}
exports.default = UISceneTransition;
