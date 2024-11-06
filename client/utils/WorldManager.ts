import { Canvg, presets } from "canvg";
import { ARROW_START_DISTANCE, BIOME_SVG_TILESETS } from "../constants";
import { interpolatedMouseX, interpolatedMouseY, scaleFactor } from "../main";
import { darkend, darkendBase } from "./small";

export default class TilesetManager {
    async generateTilesets<T extends keyof typeof BIOME_SVG_TILESETS>(biome: T): Promise<OffscreenCanvas[]> {
        const generatedTilesets = new Array(BIOME_SVG_TILESETS[biome].length);
        for (let i = 0; i < BIOME_SVG_TILESETS[biome].length; i++) {
            const offscreenCanvas = new OffscreenCanvas(256, 256);
            const offscreenCtx = offscreenCanvas.getContext("2d");

            await Canvg.fromString(offscreenCtx, BIOME_SVG_TILESETS[biome][i], {
                ...presets.offscreen(),
            }).render();

            generatedTilesets[i] = offscreenCanvas;
        }
        return generatedTilesets;
    }

    /*
const ctx = canvas.getContext("2d");

ctx.save();
ctx.fillStyle = darkend("#547db3", darkendBase);
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.restore();

ctx.save();
ctx.beginPath();

const adjustedGridSize = 300 * scaleFactor;

ctx.arc(
    30 / 2 * adjustedGridSize - (playerX * scaleFactor) + canvas.width / 2
    - Math.floor(numGridX / 30) * 30 * scaleFactor,
    (30 / 2 * adjustedGridSize - (playerY * scaleFactor) + canvas.height / 2
    - Math.floor(numGridY / 30) * 30 * scaleFactor) + (210 * scaleFactor),
    ((4.985 * (30 * 30)) - 2500) * scaleFactor, 0, Math.PI * 2,
);
ctx.clip();

ctx.fillStyle = "#547db3";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.restore();
*/
    constructWorld<T extends keyof typeof BIOME_SVG_TILESETS>(canvas: HTMLCanvasElement, tilesets: OffscreenCanvas[], biome: T, numGridX: number, numGridY: number, playerX: number, playerY: number) {
        const ctx = canvas.getContext("2d");

        const adjustedGridSize = 300 * scaleFactor;

        numGridX = Math.floor(numGridX / 30);
        numGridY = Math.floor(numGridY / 30);

        for (let i = 0; i < 30; i++) {
            for (let j = 0; j < 30; j++) {
                const x = i * adjustedGridSize - (playerX * scaleFactor) + canvas.width / 2
                    - numGridX * 30 * scaleFactor;
                const y = (j * adjustedGridSize - (playerY * scaleFactor) + canvas.height / 2
                    - numGridY * 30 * scaleFactor) + (210 * scaleFactor);
                ctx.drawImage(tilesets[Math.abs(i + j) % tilesets.length],
                    x, y,
                    adjustedGridSize + 1, adjustedGridSize + 1
                );
            }
        }

        if (biome === "ocean") {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.restore();
        }

        ctx.save();

        ctx.lineWidth = ((canvas.width * scaleFactor) * 2) + ((canvas.height * scaleFactor) * 2);
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = 0.08;
        ctx.arc(
            30 / 2 * adjustedGridSize - (playerX * scaleFactor) + canvas.width / 2
            - numGridX * 30 * scaleFactor,
            (30 / 2 * adjustedGridSize - (playerY * scaleFactor) + canvas.height / 2
                - numGridY * 30 * scaleFactor) + (210 * scaleFactor),
            ((4.985 * (30 * 30)) - 2500) * scaleFactor + ctx.lineWidth / 2, 0, Math.PI * 2,
        );
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    constructWorldMenu<T extends keyof typeof BIOME_SVG_TILESETS>(canvas: HTMLCanvasElement, tilesets: OffscreenCanvas[], biome: T, playerX: number, playerY: number) {
        const ctx = canvas.getContext("2d");

        const adjustedGridSize = 600;

        const viewRadius = 2000;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();

        const playerGridX = Math.floor(playerX / adjustedGridSize);
        const playerGridY = Math.floor(playerY / adjustedGridSize);

        const tilesRadius = Math.ceil(viewRadius / adjustedGridSize) + 2;

        for (let i = -tilesRadius; i <= tilesRadius; i++) {
            for (let j = -tilesRadius; j <= tilesRadius; j++) {
                const worldGridX = playerGridX + i;
                const worldGridY = playerGridY + j;

                const tileDistX = i * adjustedGridSize;
                const tileDistY = j * adjustedGridSize;
                const distance = Math.sqrt(tileDistX * tileDistX + tileDistY * tileDistY);

                if (distance <= viewRadius + adjustedGridSize) {
                    const x = centerX + tileDistX - (playerX % adjustedGridSize);
                    const y = centerY + tileDistY - (playerY % adjustedGridSize);

                    ctx.drawImage(tilesets[Math.abs((worldGridX + worldGridY) % tilesets.length)],
                        x, y,
                        adjustedGridSize + 1, adjustedGridSize + 1
                    );
                }
            }
        }

        ctx.restore();
        
        if (biome === "ocean") {
            ctx.save();

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = "#CCDBF2";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.restore();
        }
    }
}

