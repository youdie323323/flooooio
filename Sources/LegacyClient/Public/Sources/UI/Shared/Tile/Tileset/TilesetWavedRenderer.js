"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TilesetRenderer_1 = __importDefault(require("./TilesetRenderer"));
class TilesetWavedRenderer {
    constructor() {
        // Dont use static to make all instance different step
        this.stepPerRender = Math.random() / 200;
        this.tilesetRenderer = new TilesetRenderer_1.default();
        this.backgroundX = 0;
        this.backgroundY = 0;
        this.backgroundWaveStep = 0;
    }
    render(config) {
        this.backgroundX += 0.4;
        this.backgroundY += Math.sin(this.backgroundWaveStep) * 0.4;
        this.backgroundWaveStep += this.stepPerRender;
        this.tilesetRenderer.renderTitleTileset({
            ...config,
            translateX: this.backgroundX,
            translateY: this.backgroundY,
        });
    }
}
exports.default = TilesetWavedRenderer;
