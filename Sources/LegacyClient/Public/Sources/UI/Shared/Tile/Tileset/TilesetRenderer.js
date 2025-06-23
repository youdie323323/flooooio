"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIOME_TILESETS = exports.BIOME_SVG_TILESET = void 0;
const canvg_1 = require("canvg");
const grass_c_0_svg_1 = __importDefault(require("./Tiles/grass_c_0.svg"));
const grass_c_1_svg_1 = __importDefault(require("./Tiles/grass_c_1.svg"));
const grass_c_2_svg_1 = __importDefault(require("./Tiles/grass_c_2.svg"));
const grass_c_3_svg_1 = __importDefault(require("./Tiles/grass_c_3.svg"));
const desert_c_0_svg_1 = __importDefault(require("./Tiles/desert_c_0.svg"));
const desert_c_1_svg_1 = __importDefault(require("./Tiles/desert_c_1.svg"));
const desert_c_2_svg_1 = __importDefault(require("./Tiles/desert_c_2.svg"));
const desert_c_3_svg_1 = __importDefault(require("./Tiles/desert_c_3.svg"));
const desert_c_4_svg_1 = __importDefault(require("./Tiles/desert_c_4.svg"));
const ocean_c_0_svg_1 = __importDefault(require("./Tiles/ocean_c_0.svg"));
const ocean_c_1_svg_1 = __importDefault(require("./Tiles/ocean_c_1.svg"));
const ocean_c_2_svg_1 = __importDefault(require("./Tiles/ocean_c_2.svg"));
const ocean_c_3_svg_1 = __importDefault(require("./Tiles/ocean_c_3.svg"));
const Application_1 = require("../../../../../../Application");
const UI_1 = require("../../../UI");
const TAU = 2 * Math.PI;
// Retrived from florr map viewer (florr-io-map-viewer.glitch.me)
exports.BIOME_SVG_TILESET = {
    [0 /* Biome.GARDEN */]: [
        grass_c_0_svg_1.default,
        grass_c_1_svg_1.default,
        grass_c_2_svg_1.default,
        grass_c_3_svg_1.default,
    ],
    [1 /* Biome.DESERT */]: [
        desert_c_0_svg_1.default,
        desert_c_1_svg_1.default,
        desert_c_2_svg_1.default,
        desert_c_3_svg_1.default,
        desert_c_4_svg_1.default,
    ],
    [2 /* Biome.OCEAN */]: [
        ocean_c_0_svg_1.default,
        ocean_c_1_svg_1.default,
        ocean_c_2_svg_1.default,
        ocean_c_3_svg_1.default,
    ],
};
class TileRenderer {
    static async prepareTileset(biome) {
        return Promise.all(exports.BIOME_SVG_TILESET[biome].map((svg) => this.prepareTileFromSvg(svg)));
    }
    static async prepareTileFromSvg(svg) {
        // https://github.com/canvg/canvg/issues/379
        const highQualitySize = 256 * 4;
        const tempCanvas = new OffscreenCanvas(highQualitySize, highQualitySize);
        const tempCtx = tempCanvas.getContext("2d");
        const canvg = canvg_1.Canvg.fromString(tempCtx, svg, canvg_1.presets.offscreen());
        await canvg.render();
        return tempCanvas;
    }
    getScaledDimensions(canvas) {
        return {
            width: canvas.width / UI_1.uiScaleFactor,
            height: canvas.height / UI_1.uiScaleFactor,
        };
    }
    isWithinBounds(x, y, tilesetSize, width, height) {
        return !(x + tilesetSize < 0 ||
            x > width ||
            y + tilesetSize < 0 ||
            y > height);
    }
    renderTile(ctx, tile, x, y, size, 
    // I found the way to fix the weird seam between drawImage
    // https://stackoverflow.com/questions/9942209/unwanted-lines-appearing-in-html5-canvas-using-tiles
    // but couldnt fix it
    padding = 1 / 3) {
        ctx.drawImage(tile, x, y, size + padding, size + padding);
    }
    renderBoundaryCircle(ctx, centerX, centerY, radius, width, height) {
        ctx.save();
        ctx.lineWidth = (width + height) * 5 * Application_1.antennaScaleFactor;
        ctx.strokeStyle = "black";
        ctx.globalAlpha = 0.14;
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius + 0.5) * Application_1.antennaScaleFactor + ctx.lineWidth / 2, 0, TAU);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    renderGameTileset({ canvas, tileset, tileSize, radius, playerX, playerY, }) {
        const ctx = canvas.getContext("2d");
        const { width, height } = this.getScaledDimensions(canvas);
        const gridSize = radius / 80;
        const scaledTilesetSize = tileSize * Application_1.antennaScaleFactor;
        const centerX = (radius - playerX) * Application_1.antennaScaleFactor + width / 2;
        const centerY = (radius - playerY) * Application_1.antennaScaleFactor + height / 2;
        const startX = centerX - (gridSize / 2 * scaledTilesetSize);
        const startY = centerY - (gridSize / 2 * scaledTilesetSize);
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = startX + i * scaledTilesetSize;
                const y = startY + j * scaledTilesetSize;
                if (this.isWithinBounds(x, y, scaledTilesetSize, width, height)) {
                    this.renderTile(ctx, tileset[0], x, y, scaledTilesetSize);
                }
            }
        }
        this.renderBoundaryCircle(ctx, centerX, centerY, radius, width, height);
    }
    renderTitleTileset({ canvas, tileset, tileSize, translateX, translateY, }) {
        const ctx = canvas.getContext("2d");
        const { width, height } = this.getScaledDimensions(canvas);
        const centerX = width / 2;
        const centerY = height / 2;
        const gridX = Math.ceil(canvas.width / 800);
        const gridY = Math.ceil(canvas.height / 800);
        for (let i = -gridX; i <= gridX; i++) {
            for (let j = -gridY; j <= gridY; j++) {
                const x = centerX + (i * tileSize) - (translateX % tileSize);
                const y = centerY + (j * tileSize) - (translateY % tileSize);
                this.renderTile(ctx, tileset[0], x, y, tileSize);
            }
        }
    }
}
exports.default = TileRenderer;
exports.BIOME_TILESETS = new Map();
