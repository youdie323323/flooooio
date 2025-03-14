import type { Biome } from "../Shared/Biome";
import type Mob from "./Sources/Game/Entity/Mob";
import type Player from "./Sources/Game/Entity/Player";
import TilesetRenderer, { BIOME_SVG_TILESET, BIOME_TILESETS } from "./Sources/Game/UI/Tiled/TilesetRenderer";
import { uiScaleFactor } from "./Sources/Game/UI/UI";
import UIContext from "./Sources/Game/UI/UIContext";
import CameraController from "./Sources/Game/Utils/CameraController";
import ClientWebsocket from "./Sources/Game/Websocket/ClientWebsocket";

const canvas: HTMLCanvasElement = document.querySelector('#canvas');

export let lastTimestamp = Date.now();
export let deltaTime = 0;
export let prevTimestamp = lastTimestamp;

export const cameraController = new CameraController(canvas);

export const clientWebsocket = new ClientWebsocket(
    // Change listen for each UI
    () => uiCtx.currentCtx.additionalClientboundListen,
);

export let antennaScaleFactor = 1;

/**
 * Global instanceof ui context.
 */
export const uiCtx = new UIContext(canvas);

const init = async function () {
    // Generate tilesets beforehand so no need to generate them multiple times
    for (const biome in BIOME_SVG_TILESET) {
        const parsedBiome = parseInt(biome) as Biome;
        BIOME_TILESETS.set(parsedBiome, await TilesetRenderer.prepareTileset(parsedBiome));
    }

    clientWebsocket.connect();

    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    // Disable reload
    canvas.addEventListener("contextmenu", e => {
        e.preventDefault();
    });

    // Disable in-out
    addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === ";")) {
            e.preventDefault();
        }

        // Disable reload
        if (e.keyCode == 116 || (e.ctrlKey && e.keyCode == 82)) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("wheel", e => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
        }
    }, {
        passive: false,
    });

    function limitDelta(dy: number) {
        if (dy < 0.0125) {
            dy = 0.0125;
        }
        if (dy > 1) {
            dy = 1;
        }

        return dy;
    }

    canvas.addEventListener("wheel", X => {
        const E = X.deltaY * -0.0005 * (cameraController.zoom * 4);
        const e = cameraController.zoom + E;
        cameraController.zoom = limitDelta(e);
    });

    (function frame() {
        lastTimestamp = Date.now();
        deltaTime = lastTimestamp - prevTimestamp;
        prevTimestamp = lastTimestamp;

        antennaScaleFactor = cameraController.zoom;

        ctx.save();

        ctx.scale(uiScaleFactor, uiScaleFactor);

        uiCtx.update();

        ctx.restore();

        requestAnimationFrame(frame);
    })();
};

addEventListener("contextmenu", e => e.preventDefault());

// TODO: do this only game ui
addEventListener("beforeunload", e => e.preventDefault());

if (document.readyState === 'loading') {
    addEventListener("DOMContentLoaded", init);
} else {
    init();
}