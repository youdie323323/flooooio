import { Canvg, presets } from "canvg";
import { Biome } from "../../../../../../../Shared/Biome";
import { antennaScaleFactor } from "../../../../../../Main";
import { uiScaleFactor } from "../../../UI/UI";
import { TileMap } from "../TileMap";

import GRASS_0 from "./Tiles/grass_c_0.svg";
import GRASS_1 from "./Tiles/grass_c_1.svg";
import GRASS_2 from "./Tiles/grass_c_2.svg";
import GRASS_3 from "./Tiles/grass_c_3.svg";

import DESERT_0 from "./Tiles/desert_c_0.svg";
import DESERT_1 from "./Tiles/desert_c_1.svg";
import DESERT_2 from "./Tiles/desert_c_2.svg";
import DESERT_3 from "./Tiles/desert_c_3.svg";
import DESERT_4 from "./Tiles/desert_c_4.svg";

import OCEAN_0 from "./Tiles/ocean_c_0.svg";
import OCEAN_1 from "./Tiles/ocean_c_1.svg";
import OCEAN_2 from "./Tiles/ocean_c_2.svg";
import OCEAN_3 from "./Tiles/ocean_c_3.svg";
import { vec2 } from "@basementuniverse/vec";

const TAU = Math.PI * 2;

// Retrived from florr map viewer (florr-io-map-viewer.glitch.me)
export const BIOME_SVG_TILESET = {
    [Biome.GARDEN]: [
        GRASS_0,
        GRASS_1,
        GRASS_2,
        GRASS_3,
    ],
    [Biome.DESERT]: [
        DESERT_0,
        DESERT_1,
        DESERT_2,
        DESERT_3,
        DESERT_4,
    ],
    [Biome.OCEAN]: [
        OCEAN_0,
        OCEAN_1,
        OCEAN_2,
        OCEAN_3,
    ],
} as const satisfies Record<Biome, Array<string>>;

type Tile = OffscreenCanvas;
type Tileset = Array<Tile>;

export interface RenderingConfig {
    canvas: HTMLCanvasElement;
    tileset: Tileset;
    tileSize: number;
}

export interface MapRenderingOptions extends RenderingConfig {
    radius: number;
    playerX: number;
    playerY: number;
}

export interface TitleRenderingOptions extends RenderingConfig {
    translateX: number;
    translateY: number;
}

export default class TilesetRenderer {
    private tileMap: TileMap;

    static async prepareTileset(
        biome: keyof typeof BIOME_SVG_TILESET,
    ): Promise<Tileset> {
        return Promise.all(
            BIOME_SVG_TILESET[biome].map((svg: string) => this.prepareTileFromSvg(svg)),
        );
    }

    static async prepareTileFromSvg(svg: string): Promise<Tile> {
        // https://github.com/canvg/canvg/issues/379

        const highQualitySize = 256 * 4;

        const tempCanvas = new OffscreenCanvas(highQualitySize, highQualitySize);
        const tempCtx = tempCanvas.getContext("2d");

        const canvg = Canvg.fromString(tempCtx, svg, presets.offscreen());

        await canvg.render();

        return tempCanvas;
    }

    private initializeMap(tileset: Tileset, tileSize: number): void {
        const tilesetLength = tileset.length;

        this.tileMap = new TileMap({
            clampPositionToBounds: false,
            tileSize: tileSize,
            layers: [
                {
                    name: "default",
                    tiles: tileset.map((tile, i) => ({
                        name: `tile_${i}`,
                        image: tile,
                    })),
                    data: Array.from(
                        { length: 10 }, 
                        () => Array.from({ length: 10 }, () => Math.floor(Math.random() * tilesetLength)),
                    ),
                },
            ],
            chunkSize: 4,
            chunkBorder: 1,
            chunkBufferMaxSize: 64,
            debug: false,
        });
    }

    private getScaledDimensions(canvas: HTMLCanvasElement) {
        return {
            width: canvas.width / uiScaleFactor,
            height: canvas.height / uiScaleFactor,
        };
    }

    private renderTile(
        ctx: CanvasRenderingContext2D,

        tileset: OffscreenCanvas,

        x: number,
        y: number,

        size: number,

        // I found the way to fix the weird seam between drawImage
        // https://stackoverflow.com/questions/9942209/unwanted-lines-appearing-in-html5-canvas-using-tiles
        // but couldnt fix it
        padding: number = 1 / 3,
    ) {
        ctx.drawImage(
            tileset,
            x, y,
            size + padding,
            size + padding,
        );
    }

    private renderBoundaryCircle(
        ctx: CanvasRenderingContext2D,

        centerX: number,
        centerY: number,

        radius: number,

        width: number,
        height: number,
    ) {
        ctx.save();

        ctx.lineWidth = (width + height) * 5 * antennaScaleFactor;
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = 0.14;

        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            (radius + 0.5) * antennaScaleFactor + ctx.lineWidth / 2,
            0,
            TAU,
        );
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    public renderGameTileset({
        canvas,
        tileset,
        tileSize,
        radius,
        playerX,
        playerY,
    }: MapRenderingOptions) {
        if (!this.tileMap) {
            this.initializeMap(tileset, tileSize);
        }

        const ctx = canvas.getContext("2d");
        const { width, height } = this.getScaledDimensions(canvas);

        this.tileMap.draw(ctx, vec2(width, height), vec2(playerX, playerY), antennaScaleFactor);

        this.renderBoundaryCircle(
            ctx,
            (radius - playerX) * antennaScaleFactor + width / 2,
            (radius - playerY) * antennaScaleFactor + height / 2,
            radius,
            width,
            height,
        );
    }

    public renderTitleTileset({
        canvas,
        tileset,
        tileSize,
        translateX,
        translateY,
    }: TitleRenderingOptions) {
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

export const BIOME_TILESETS: Map<Biome, Tileset> = new Map();