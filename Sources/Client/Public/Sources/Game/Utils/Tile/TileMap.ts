import { LRUMap } from "lru_map";
import { vec2 } from "@basementuniverse/vec";
import { clamp } from "@basementuniverse/utils";

export type TileMapOptionsData<T extends object = any> = Partial<
    Omit<
        TileMapOptions,
        | "preRender"
        | "postRender"
        | "preGenerateChunk"
        | "postGenerateChunk"
        | "debug"
    >
> & {
    layers?: Array<TileMapLayerOptionsData<T>>;
};

export type TileMapLayerOptionsData<T extends object = any> = Omit<
    TileMapLayerOptions,
    | "preRenderTile"
    | "postRenderTile"
> & {
    tiles?: Array<Omit<TileDefinition<T>, "image"> & {
        imageName: string;
    }>;
    width?: number;
    data: Array<number>;
};

export type TileMapOptions<T extends object = any> = {
    /**
     * The bounds of the tile map, measured in tiles.
     *
     * @remarks
     * Defines the position of the top-left and bottom-right corners of the
     * tile grid, used when rendering layer data.
     *
     * If not defined, layer data will start at (0, 0).
     */
    bounds?: Bounds;

    /**
     * If true, the camera position will be clamped to the bounds.
     *
     * @remarks
     * Set this to false for infinite tilemaps.
     *
     * Ignored if no bounds are defined.
     *
     * @defaultValue false
     */
    clampPositionToBounds: boolean;

    /**
     * The minimum scale factor.
     */
    minScale?: number;

    /**
     * The maximum scale factor.
     */
    maxScale?: number;

    /**
     * The size of each tile, measured in pixels.
     *
     * @defaultValue 16
     */
    tileSize: number;

    /**
     * A list of layers.
     *
     * @remarks
     * Defined in ascending render order; layers[0] will be rendered first, then
     * layers[1] on top of that, etc.
     */
    layers: Array<TileMapLayerOptions<T>>;

    /**
     * The size of each render chunk, measured in tiles.
     *
     * @defaultValue 8
     */
    chunkSize: number;

    /**
     * Buffer area around the render area where we will load and render chunks,
     * measured in chunks.
     *
     * @remarks
     * This can be useful if rendering a chunk is quite slow; we can improve
     * the chances that a chunk will be ready to render by the time it appears
     * on-screen by increasing this number (although it means more chunks will
     * be rendered per frame).
     *
     * If set to a negative number, only render chunks which are fully inside
     * the screen bounds.
     *
     * @defaultValue vec2(1)
     */
    chunkBorder: vec2;

    /**
     * The maximum size of the LRU cache/queue.
     *
     * @defaultValue 64
     */
    chunkBufferMaxSize: number;

    /**
     * Optional debug options.
     *
     * @remarks
     * Can be a boolean value (in which case all sub-options will be set to the
     * same value), or an object allowing specific debug options to be enabled
     * individually.
     */
    debug?: Partial<TileMapDebugOptions> | boolean;
};

export type TileMapLayerOptions<T extends object = any> = {
    /**
     * The name of this layer.
     */
    name: string;

    /**
     * A list of tile definitions to use for tiles.
     *
     * @remarks
     * If this is not defined or empty, no tiles will be rendered.
     * The layer data will reference indexes in this array.
     */
    tiles?: Array<TileDefinition<T>>;

    /**
     * Layer data, represented as a 2d-array of indexes into the images array.
     *
     * @remarks
     * -1 means there is no tile at this position.
     */
    data?: Array<Array<number>>;

    /**
     * Opacity of this layer, represented as a number between 0 (fully
     * transparent) and 1 (fully opaque).
     *
     * @defaultValue 1
     */
    opacity?: number;
};

type TileMapDebugOptions = {
    showOrigin: boolean;
    showChunkBorders: boolean;
    showChunkLabels: boolean;
    showTileBorders: boolean;
};

export type Bounds = {
    /**
     * The top-left corner of the tile map, measured in tiles
     */
    topLeft: vec2;

    /**
     * The bottom-right corner of the tile map, measured in tiles
     */
    bottomRight: vec2;
};

export type TileDefinition<T extends object = any> = {
    name: string;
    image: TileMapImage;

    [key: string]: any;
} & T;

type TileMapImage = HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;

type TileMapChunk = {
    chunkPosition: vec2;
    image: OffscreenCanvas;
};

/**
 * Simplified interface for the camera component.
 *
 * @remarks
 * We can optionally pass this to the draw method instead of explicitly
 * passing the screen size, camera position and camera scale.
 */
interface Camera {
    position: vec2;
    readonly actualPosition: vec2;

    scale: number;
    readonly actualScale: number;

    bounds: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

function pointInRectangle(
    point: vec2,
    topLeft: vec2,
    bottomRight: vec2,
): boolean {
    return (
        point.x >= topLeft.x &&
        point.y >= topLeft.y &&
        point.x < bottomRight.x &&
        point.y < bottomRight.y
    );
}

export function cameraBoundsToTileMapBounds(bounds: Camera["bounds"]): Bounds {
    return {
        topLeft: vec2(bounds.left, bounds.top),
        bottomRight: vec2(bounds.right, bounds.bottom),
    };
}

export function cameraBoundsSize(bounds: Camera["bounds"]): vec2 {
    const convertedBounds = cameraBoundsToTileMapBounds(bounds);

    return vec2.sub(convertedBounds.bottomRight, convertedBounds.topLeft);
}

/**
 * @deprecated Shit!
 */
export class TileMap<T extends object = any> {
    private static readonly DEFAULT_OPTIONS = {
        clampPositionToBounds: false,
        tileSize: 16,
        layers: [],
        chunkSize: 8,
        chunkBorder: vec2(1),
        chunkBufferMaxSize: 64,
    } as const satisfies TileMapOptions;

    private static readonly DEBUG_ORIGIN_COLOUR = "cyan";
    private static readonly DEBUG_ORIGIN_LINE_WIDTH = 2;
    private static readonly DEBUG_ORIGIN_SIZE = 10;

    private static readonly DEBUG_CHUNK_BORDER_COLOUR = "yellow";
    private static readonly DEBUG_CHUNK_BORDER_LINE_WIDTH = 2;

    private static readonly DEBUG_CHUNK_LABEL_COLOUR = "white";
    private static readonly DEBUG_CHUNK_LABEL_FONT = "12px monospace";

    private static readonly DEBUG_TILE_BORDER_COLOUR = "orange";
    private static readonly DEBUG_TILE_BORDER_LINE_WIDTH = 1;

    private options: TileMapOptions<T> & {
        debug: Required<TileMapDebugOptions>;
    };

    private chunkBuffer: LRUMap<string, TileMapChunk>;

    public constructor(options?: Partial<TileMapOptions<T>>) {
        const actualOptions = Object.assign(
            {},
            TileMap.DEFAULT_OPTIONS,
            options ?? {},
        );

        if (!actualOptions.debug || actualOptions.debug === true) {
            actualOptions.debug = {
                showOrigin: !!actualOptions.debug,
                showChunkBorders: !!actualOptions.debug,
                showChunkLabels: !!actualOptions.debug,
                showTileBorders: !!actualOptions.debug,
            };
        }

        this.options = actualOptions as typeof this.options;

        this.chunkBuffer = new LRUMap(this.options.chunkBufferMaxSize);
    }

    private hashvector(v: vec2): string {
        return vec2.str(v);
    }

    public draw(
        context: CanvasRenderingContext2D,
        screen: vec2,
        position: vec2,
        scale: number,
    ) {
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
        let actualPosition = vec2(position);
        if (clampPositionToBounds && bounds) {
            const tileSizeScaled = tileSize / actualScale;
            const halfScreenScaled = vec2.map(
                vec2.mul(screen, 1 / (actualScale * 2)),
                Math.ceil,
            );
            const minPosition = vec2(
                bounds.topLeft.x * tileSizeScaled + halfScreenScaled.x,
                bounds.topLeft.y * tileSizeScaled + halfScreenScaled.y,
            );
            const maxPosition = vec2(
                bounds.bottomRight.x * tileSizeScaled - halfScreenScaled.x,
                bounds.bottomRight.y * tileSizeScaled - halfScreenScaled.y,
            );

            actualPosition = vec2(
                clamp(actualPosition.x, minPosition.x, maxPosition.x),
                clamp(actualPosition.y, minPosition.y, maxPosition.y),
            );
        }

        const screenSizeInChunks = vec2.map(
            vec2.mul(
                screen,
                1 / (absoluteChunkSize * actualScale),
            ),
            Math.ceil,
        );
        const screenCenterChunk = vec2.map(
            vec2.mul(actualPosition, 1 / absoluteChunkSize),
            Math.floor,
        );
        const topLeftChunk = vec2.sub(
            vec2.sub(
                screenCenterChunk,
                vec2.map(
                    vec2.mul(screenSizeInChunks, 0.5),
                    Math.ceil,
                ),
            ),
            chunkBorder,
        );
        const bottomRightChunk = vec2.add(
            vec2.add(
                screenCenterChunk,
                vec2.map(
                    vec2.mul(screenSizeInChunks, 0.5),
                    Math.ceil,
                ),
            ),
            chunkBorder,
        );

        context.save();

        context.scale(actualScale, actualScale);
        context.translate(
            -actualPosition.x + screen.x / (actualScale * 2),
            -actualPosition.y + screen.y / (actualScale * 2),
        );

        // Render chunks
        for (let y = topLeftChunk.y; y < bottomRightChunk.y; y++) {
            for (let x = topLeftChunk.x; x < bottomRightChunk.x; x++) {
                const chunkPosition = vec2(x, y);
                const chunkAbsolutePosition = vec2.mul(chunkPosition, absoluteChunkSize);

                // Check if we have this chunk in the cache
                const chunkHash = this.hashvector(chunkPosition);
                if (!this.chunkBuffer.has(chunkHash)) {
                    this.chunkBuffer.set(chunkHash, this.generateChunk(
                        chunkPosition,
                        absoluteChunkSize,
                    ));
                }

                const chunk = this.chunkBuffer.get(chunkHash);
                if (chunk) {
                    context.drawImage(
                        chunk.image,
                        chunkAbsolutePosition.x,
                        chunkAbsolutePosition.y,
                    );
                }
            }
        }

        // Render debug helpers
        if (this.options.debug.showTileBorders) {
            const topLeftTile = vec2.mul(
                vec2.sub(
                    screenCenterChunk,
                    vec2.add(
                        vec2.map(
                            vec2.mul(screenSizeInChunks, 0.5),
                            Math.ceil,
                        ),
                        vec2(1),
                    ),
                ),
                chunkSize,
            );
            const bottomRightTile = vec2.mul(
                vec2.add(
                    screenCenterChunk,
                    vec2.add(
                        vec2.map(
                            vec2.mul(screenSizeInChunks, 0.5),
                            Math.ceil,
                        ),
                        vec2(1),
                    ),
                ),
                chunkSize,
            );

            for (let y = topLeftTile.y; y < bottomRightTile.y; y++) {
                this.drawLine(
                    context,
                    vec2(
                        actualPosition.x - screen.x / (actualScale * 2),
                        y * tileSize,
                    ),
                    vec2(
                        actualPosition.x + screen.x / (actualScale * 2),
                        y * tileSize,
                    ),
                    TileMap.DEBUG_TILE_BORDER_COLOUR,
                    TileMap.DEBUG_TILE_BORDER_LINE_WIDTH,
                );
            }

            for (let x = topLeftTile.x; x < bottomRightTile.x; x++) {
                this.drawLine(
                    context,
                    vec2(
                        x * tileSize,
                        actualPosition.y - screen.y / (actualScale * 2),
                    ),
                    vec2(
                        x * tileSize,
                        actualPosition.y + screen.y / (actualScale * 2),
                    ),
                    TileMap.DEBUG_TILE_BORDER_COLOUR,
                    TileMap.DEBUG_TILE_BORDER_LINE_WIDTH,
                );
            }
        }

        if (this.options.debug.showChunkBorders) {
            for (let y = topLeftChunk.y; y < bottomRightChunk.y; y++) {
                this.drawLine(
                    context,
                    vec2(
                        actualPosition.x - screen.x / (actualScale * 2),
                        y * absoluteChunkSize,
                    ),
                    vec2(
                        actualPosition.x + screen.x / (actualScale * 2),
                        y * absoluteChunkSize,
                    ),
                    TileMap.DEBUG_CHUNK_BORDER_COLOUR,
                    TileMap.DEBUG_CHUNK_BORDER_LINE_WIDTH,
                );
            }

            for (let x = topLeftChunk.x; x < bottomRightChunk.x; x++) {
                this.drawLine(
                    context,
                    vec2(
                        x * absoluteChunkSize,
                        actualPosition.y - screen.y / (actualScale * 2),
                    ),
                    vec2(
                        x * absoluteChunkSize,
                        actualPosition.y + screen.y / (actualScale * 2),
                    ),
                    TileMap.DEBUG_CHUNK_BORDER_COLOUR,
                    TileMap.DEBUG_CHUNK_BORDER_LINE_WIDTH,
                );
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
                    context.fillText(
                        `${x}, ${y}`,
                        x * absoluteChunkSize + absoluteChunkSize / 2,
                        y * absoluteChunkSize + absoluteChunkSize / 2,
                    );
                }
            }

            context.restore();
        }

        if (
            this.options.debug.showOrigin &&
            pointInRectangle(vec2(0, 0), topLeftChunk, bottomRightChunk)
        ) {
            this.drawCross(
                context,
                vec2(0, 0),
                TileMap.DEBUG_ORIGIN_COLOUR,
                TileMap.DEBUG_ORIGIN_LINE_WIDTH,
                TileMap.DEBUG_ORIGIN_SIZE,
            );
        }

        context.restore();
    }

    private generateChunk(
        chunkPosition: vec2,
        absoluteChunkSize: number,
    ): TileMapChunk {
        const { tileSize, chunkSize, bounds, layers } = this.options;

        const chunkCanvas = new OffscreenCanvas(absoluteChunkSize, absoluteChunkSize);
        const chunkContext = chunkCanvas.getContext("2d");

        const chunk = {
            chunkPosition,
            image: chunkCanvas,
        } satisfies TileMapChunk;

        const topLeftTile = vec2.mul(chunkPosition, chunkSize);
        const bottomRightTile = vec2.add(
            topLeftTile,
            vec2(chunkSize - 1),
        );
        const boundsTopLeft = bounds?.topLeft ?? vec2(0);

        chunkContext.save();

        // Default generation, render tiles from tilemap data
        for (const layer of layers) {
            chunkContext.globalAlpha = layer.opacity ?? 1;

            for (let y = topLeftTile.y; y <= bottomRightTile.y; y++) {
                for (let x = topLeftTile.x; x <= bottomRightTile.x; x++) {
                    const tilePosition = vec2(x, y);

                    const tileDataPosition = vec2.sub(
                        tilePosition,
                        boundsTopLeft,
                    );

                    if (tileDataPosition.x < 0 || tileDataPosition.y < 0) {
                        continue;
                    }

                    const tileData = layer.data
                        ?.[tileDataPosition.y]
                        ?.[tileDataPosition.x];
                    if (tileData === undefined || tileData === -1) {
                        continue;
                    }

                    const tileImage = layer.tiles?.[tileData]?.image;
                    if (!tileImage) {
                        continue;
                    }

                    const tileAbsolutePosition = vec2.sub(
                        vec2.mul(
                            tilePosition,
                            tileSize,
                        ),
                        vec2.mul(chunkPosition, absoluteChunkSize),
                    );

                    chunkContext.drawImage(
                        tileImage,
                        tileAbsolutePosition.x,
                        tileAbsolutePosition.y,
                        tileSize,
                        tileSize,
                    );
                }
            }
        }

        chunkContext.restore();

        return chunk;
    }

    private drawLine(
        context: CanvasRenderingContext2D,
        start: vec2,
        end: vec2,
        colour: string,
        lineWidth: number,
    ) {
        context.save();

        context.lineWidth = lineWidth;
        context.strokeStyle = colour;

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();

        context.restore();
    }

    private drawCross(
        context: CanvasRenderingContext2D,
        position: vec2,
        colour: string,
        lineWidth: number,
        size: number,
    ) {
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