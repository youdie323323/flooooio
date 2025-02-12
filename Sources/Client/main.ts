import { Biome } from "../Shared/biome";
import Mob from "./Sources/Entity/Mob";
import Player from "./Sources/Entity/Player";
import { uiScaleFactor } from "./Sources/Ui/UserInterface";
import UserInterfaceContext from "./Sources/Ui/UserInterfaceContext";
import CameraController from "./Sources/Utils/CameraController";
import Networking from "./Sources/Utils/Networking";
import TilesetRenderer, { BIOME_SVG_TILESET, BIOME_TILESETS } from "./Sources/Ui/Tiled/TilesetRenderer";

const canvas: HTMLCanvasElement = document.querySelector('#canvas');

export let ws: WebSocket;
export let networking: Networking;

export let lastTimestamp = Date.now();
export let deltaTime = 0;
export let prevTimestamp = lastTimestamp;

export const players: Map<number, Player> = new Map();
export const mobs: Map<number, Mob> = new Map();

export const cameraController = new CameraController(canvas);

export let antennaScaleFactor = 1;

/**
 * Global instanceof ui context.
 */
export const uiCtx = new UserInterfaceContext(canvas);

const init = async function () {
    // Generate tilesets beforehand so no need to generate them multiple times
    for (const biome in BIOME_SVG_TILESET) {
        const parsedBiome = parseInt(biome) as Biome;
        BIOME_TILESETS.set(parsedBiome, await TilesetRenderer.prepareTileset(parsedBiome));
    }

    function showElement(id: string) {
        const element = document.getElementById(id);
        if (element) element.style.display = "block";
    }

    function hideElement(id: string) {
        const element = document.getElementById(id);
        if (element) element.style.display = "none";
    }

    function asyncWebsocket(address: string | URL): Promise<WebSocket> {
        return new Promise(function (resolve, reject) {
            const ws = new WebSocket(address);
            ws.binaryType = "arraybuffer";
            ws.onopen = function () {
                resolve(ws);
            };
            ws.onerror = function (err) {
                reject(err);
            };
        });
    }

    try {
        ws = await asyncWebsocket("ws://" + location.host);
        const statusContainer = document.getElementById("status-container");
        if (statusContainer) {
            document.body.style.backgroundColor = 'rgba(24, 24, 24, 0)';
            statusContainer.remove();
            showElement("canvas");
        }
    } catch (e) {
        hideElement("loading");
        showElement("errorDialog");

        return;
    }

    // Reassign them, to access networking from anywhere
    networking = new Networking(ws);

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
        passive: false
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