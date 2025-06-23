"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileMap = void 0;
exports.cameraBoundsToTileMapBounds = cameraBoundsToTileMapBounds;
exports.cameraBoundsSize = cameraBoundsSize;
const lru_map_1 = require("lru_map");
const vec_1 = require("@basementuniverse/vec");
const utils_1 = require("@basementuniverse/utils");
function pointInRectangle(point, topLeft, bottomRight) {
    return (point.x >= topLeft.x &&
        point.y >= topLeft.y &&
        point.x < bottomRight.x &&
        point.y < bottomRight.y);
}
function cameraBoundsToTileMapBounds(bounds) {
    return {
        topLeft: (0, vec_1.vec2)(bounds.left, bounds.top),
        bottomRight: (0, vec_1.vec2)(bounds.right, bounds.bottom),
    };
}
function cameraBoundsSize(bounds) {
    const convertedBounds = cameraBoundsToTileMapBounds(bounds);
    return vec_1.vec2.sub(convertedBounds.bottomRight, convertedBounds.topLeft);
}
/**
 * @deprecated Shit!
 */
class TileMap {
    static { this.DEFAULT_OPTIONS = {
        clampPositionToBounds: false,
        tileSize: 16,
        layers: [],
        chunkSize: 8,
        chunkBorder: (0, vec_1.vec2)(1),
        chunkBufferMaxSize: 64,
    }; }
    static { this.DEBUG_ORIGIN_COLOUR = "cyan"; }
    static { this.DEBUG_ORIGIN_LINE_WIDTH = 2; }
    static { this.DEBUG_ORIGIN_SIZE = 10; }
    static { this.DEBUG_CHUNK_BORDER_COLOUR = "yellow"; }
    static { this.DEBUG_CHUNK_BORDER_LINE_WIDTH = 2; }
    static { this.DEBUG_CHUNK_LABEL_COLOUR = "white"; }
    static { this.DEBUG_CHUNK_LABEL_FONT = "12px monospace"; }
    static { this.DEBUG_TILE_BORDER_COLOUR = "orange"; }
    static { this.DEBUG_TILE_BORDER_LINE_WIDTH = 1; }
    constructor(options) {
        const actualOptions = Object.assign({}, TileMap.DEFAULT_OPTIONS, options ?? {});
        if (!actualOptions.debug || actualOptions.debug === true) {
            actualOptions.debug = {
                showOrigin: !!actualOptions.debug,
                showChunkBorders: !!actualOptions.debug,
                showChunkLabels: !!actualOptions.debug,
                showTileBorders: !!actualOptions.debug,
            };
        }
        this.options = actualOptions;
        this.chunkBuffer = new lru_map_1.LRUMap(this.options.chunkBufferMaxSize);
    }
    hashvector(v) {
        return vec_1.vec2.str(v);
    }
    draw(context, screen, position, scale) {
        const { tileSize, chunkSize, chunkBorder, minScale, maxScale, clampPositionToBounds, bounds } = this.options;
        const absoluteChunkSize = tileSize * chunkSize;
        // Maybe clamp scale
        let actualScale = scale;
        if (minScale && actualScale < minScale) {
            actualScale = minScale;
        }
        if (maxScale && actualScale > maxScale) {
            actualScale = maxScale;
        }
        // Maybe clamp position to bounds
        let actualPosition = (0, vec_1.vec2)(position);
        if (clampPositionToBounds && bounds) {
            const tileSizeScaled = tileSize / actualScale;
            const halfScreenScaled = vec_1.vec2.map(vec_1.vec2.mul(screen, 1 / (actualScale * 2)), Math.ceil);
            const minPosition = (0, vec_1.vec2)(bounds.topLeft.x * tileSizeScaled + halfScreenScaled.x, bounds.topLeft.y * tileSizeScaled + halfScreenScaled.y);
            const maxPosition = (0, vec_1.vec2)(bounds.bottomRight.x * tileSizeScaled - halfScreenScaled.x, bounds.bottomRight.y * tileSizeScaled - halfScreenScaled.y);
            actualPosition = (0, vec_1.vec2)((0, utils_1.clamp)(actualPosition.x, minPosition.x, maxPosition.x), (0, utils_1.clamp)(actualPosition.y, minPosition.y, maxPosition.y));
        }
        const screenSizeInChunks = vec_1.vec2.map(vec_1.vec2.mul(screen, 1 / (absoluteChunkSize * actualScale)), Math.ceil);
        const screenCenterChunk = vec_1.vec2.map(vec_1.vec2.mul(actualPosition, 1 / absoluteChunkSize), Math.floor);
        const topLeftChunk = vec_1.vec2.sub(vec_1.vec2.sub(screenCenterChunk, vec_1.vec2.map(vec_1.vec2.mul(screenSizeInChunks, 0.5), Math.ceil)), chunkBorder);
        const bottomRightChunk = vec_1.vec2.add(vec_1.vec2.add(screenCenterChunk, vec_1.vec2.map(vec_1.vec2.mul(screenSizeInChunks, 0.5), Math.ceil)), chunkBorder);
        context.save();
        context.scale(actualScale, actualScale);
        context.translate(-actualPosition.x + screen.x / (actualScale * 2), -actualPosition.y + screen.y / (actualScale * 2));
        // Render chunks
        for (let y = topLeftChunk.y; y < bottomRightChunk.y; y++) {
            for (let x = topLeftChunk.x; x < bottomRightChunk.x; x++) {
                const chunkPosition = (0, vec_1.vec2)(x, y);
                const chunkAbsolutePosition = vec_1.vec2.mul(chunkPosition, absoluteChunkSize);
                // Check if we have this chunk in the cache
                const chunkHash = this.hashvector(chunkPosition);
                if (!this.chunkBuffer.has(chunkHash)) {
                    this.chunkBuffer.set(chunkHash, this.generateChunk(chunkPosition, absoluteChunkSize));
                }
                const chunk = this.chunkBuffer.get(chunkHash);
                if (chunk) {
                    context.drawImage(chunk.image, chunkAbsolutePosition.x, chunkAbsolutePosition.y);
                }
            }
        }
        // Render debug helpers
        if (this.options.debug.showTileBorders) {
            const topLeftTile = vec_1.vec2.mul(vec_1.vec2.sub(screenCenterChunk, vec_1.vec2.add(vec_1.vec2.map(vec_1.vec2.mul(screenSizeInChunks, 0.5), Math.ceil), (0, vec_1.vec2)(1))), chunkSize);
            const bottomRightTile = vec_1.vec2.mul(vec_1.vec2.add(screenCenterChunk, vec_1.vec2.add(vec_1.vec2.map(vec_1.vec2.mul(screenSizeInChunks, 0.5), Math.ceil), (0, vec_1.vec2)(1))), chunkSize);
            for (let y = topLeftTile.y; y < bottomRightTile.y; y++) {
                this.drawLine(context, (0, vec_1.vec2)(actualPosition.x - screen.x / (actualScale * 2), y * tileSize), (0, vec_1.vec2)(actualPosition.x + screen.x / (actualScale * 2), y * tileSize), TileMap.DEBUG_TILE_BORDER_COLOUR, TileMap.DEBUG_TILE_BORDER_LINE_WIDTH);
            }
            for (let x = topLeftTile.x; x < bottomRightTile.x; x++) {
                this.drawLine(context, (0, vec_1.vec2)(x * tileSize, actualPosition.y - screen.y / (actualScale * 2)), (0, vec_1.vec2)(x * tileSize, actualPosition.y + screen.y / (actualScale * 2)), TileMap.DEBUG_TILE_BORDER_COLOUR, TileMap.DEBUG_TILE_BORDER_LINE_WIDTH);
            }
        }
        if (this.options.debug.showChunkBorders) {
            for (let y = topLeftChunk.y; y < bottomRightChunk.y; y++) {
                this.drawLine(context, (0, vec_1.vec2)(actualPosition.x - screen.x / (actualScale * 2), y * absoluteChunkSize), (0, vec_1.vec2)(actualPosition.x + screen.x / (actualScale * 2), y * absoluteChunkSize), TileMap.DEBUG_CHUNK_BORDER_COLOUR, TileMap.DEBUG_CHUNK_BORDER_LINE_WIDTH);
            }
            for (let x = topLeftChunk.x; x < bottomRightChunk.x; x++) {
                this.drawLine(context, (0, vec_1.vec2)(x * absoluteChunkSize, actualPosition.y - screen.y / (actualScale * 2)), (0, vec_1.vec2)(x * absoluteChunkSize, actualPosition.y + screen.y / (actualScale * 2)), TileMap.DEBUG_CHUNK_BORDER_COLOUR, TileMap.DEBUG_CHUNK_BORDER_LINE_WIDTH);
            }
        }
        if (this.options.debug.showChunkLabels) {
            context.save();
            context.fillStyle = TileMap.DEBUG_CHUNK_LABEL_COLOUR;
            context.font = TileMap.DEBUG_CHUNK_LABEL_FONT;
            context.textBaseline = "middle";
            context.textAlign = "center";
            for (let y = topLeftChunk.y; y < bottomRightChunk.y; y++) {
                for (let x = topLeftChunk.x; x < bottomRightChunk.x; x++) {
                    context.fillText(`${x}, ${y}`, x * absoluteChunkSize + absoluteChunkSize / 2, y * absoluteChunkSize + absoluteChunkSize / 2);
                }
            }
            context.restore();
        }
        if (this.options.debug.showOrigin &&
            pointInRectangle((0, vec_1.vec2)(0, 0), topLeftChunk, bottomRightChunk)) {
            this.drawCross(context, (0, vec_1.vec2)(0, 0), TileMap.DEBUG_ORIGIN_COLOUR, TileMap.DEBUG_ORIGIN_LINE_WIDTH, TileMap.DEBUG_ORIGIN_SIZE);
        }
        context.restore();
    }
    generateChunk(chunkPosition, absoluteChunkSize) {
        const { tileSize, chunkSize, bounds, layers } = this.options;
        const chunkCanvas = new OffscreenCanvas(absoluteChunkSize, absoluteChunkSize);
        const chunkContext = chunkCanvas.getContext("2d");
        const chunk = {
            chunkPosition,
            image: chunkCanvas,
        };
        const topLeftTile = vec_1.vec2.mul(chunkPosition, chunkSize);
        const bottomRightTile = vec_1.vec2.add(topLeftTile, (0, vec_1.vec2)(chunkSize - 1));
        const boundsTopLeft = bounds?.topLeft ?? (0, vec_1.vec2)(0);
        chunkContext.save();
        // Default generation, render tiles from tilemap data
        for (const layer of layers) {
            chunkContext.globalAlpha = layer.opacity ?? 1;
            for (let y = topLeftTile.y; y <= bottomRightTile.y; y++) {
                for (let x = topLeftTile.x; x <= bottomRightTile.x; x++) {
                    const tilePosition = (0, vec_1.vec2)(x, y);
                    const tileDataPosition = vec_1.vec2.sub(tilePosition, boundsTopLeft);
                    if (tileDataPosition.x < 0 || tileDataPosition.y < 0) {
                        continue;
                    }
                    const tileData = layer.data?.[tileDataPosition.y]?.[tileDataPosition.x];
                    if (tileData === undefined || tileData === -1) {
                        continue;
                    }
                    const tileImage = layer.tiles?.[tileData]?.image;
                    if (!tileImage) {
                        continue;
                    }
                    const tileAbsolutePosition = vec_1.vec2.sub(vec_1.vec2.mul(tilePosition, tileSize), vec_1.vec2.mul(chunkPosition, absoluteChunkSize));
                    chunkContext.drawImage(tileImage, tileAbsolutePosition.x, tileAbsolutePosition.y, tileSize, tileSize);
                }
            }
        }
        chunkContext.restore();
        return chunk;
    }
    drawLine(context, start, end, colour, lineWidth) {
        context.save();
        context.lineWidth = lineWidth;
        context.strokeStyle = colour;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
        context.restore();
    }
    drawCross(context, position, colour, lineWidth, size) {
        context.save();
        context.lineWidth = lineWidth;
        const halfSize = Math.ceil(size / 2);
        context.strokeStyle = colour;
        context.beginPath();
        context.moveTo(position.x - halfSize, position.y - halfSize);
        context.lineTo(position.x + halfSize, position.y + halfSize);
        context.moveTo(position.x - halfSize, position.y + halfSize);
        context.lineTo(position.x + halfSize, position.y - halfSize);
        context.stroke();
        context.restore();
    }
}
exports.TileMap = TileMap;
