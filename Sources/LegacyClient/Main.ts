import type { Biome } from "./Public/Sources/Native/Biome";
import { uiScaleFactor } from "./Public/Sources/UI/UI";
import UIContext from "./Public/Sources/UI/UIContext";
import CameraController from "./Public/Sources/Utils/CameraController";
import TileRenderer, { BIOME_SVG_TILESET, BIOME_TILESETS } from "./Public/Sources/Utils/Tile/Tileset/TilesetRenderer";
import ClientWebsocket from "./Public/Sources/Websocket/ClientWebsocket";

export let lastTimestamp = Date.now();
export let deltaTime = 0;
export let prevTimestamp = lastTimestamp;

/**
 * Global instanceof ui context.
 */
export let uiCtx: UIContext;

export let clientWebsocket: ClientWebsocket;

export let antennaScaleFactor = 1;

export let cameraController: CameraController;

const init = async () => {
    // Generate tilesets beforehand so no need to generate them multiple times
    for (const biome in BIOME_SVG_TILESET) {
        const parsedBiome = parseInt(biome) as Biome;
        BIOME_TILESETS.set(parsedBiome, await TileRenderer.prepareTileset(parsedBiome));
    }

    document.body.removeChild(document.querySelector("#status-container"));

    const canvas = document.querySelector<HTMLCanvasElement>("#canvas");

    const ctx: CanvasRenderingContext2D = canvas.getContext("2d", { alpha: false });

    uiCtx = new UIContext(canvas);

    clientWebsocket = new ClientWebsocket(
        // Change listen for each UI
        () => uiCtx.currentCtx.CLIENTBOUND_HANDLERS,
    );

    cameraController = new CameraController(canvas);

    clientWebsocket.connect();

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

if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", init);
} else {
    init();
}