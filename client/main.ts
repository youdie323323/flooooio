import { STANDARD_WIDTH, STANDARD_HEIGHT } from "./constants";
import EntityPlayer from "./entity/EntityPlayer";
import CameraController from "./common/CameraController";
import EntityMob from "./entity/EntityMob";
import { interpolate } from "./common/Interpolator";
import { UserInterfaceManager } from "./ui/UserInterfaceManager";
import { MoodKind } from "../shared/mood";
import Networking from "./Networking";

export let ws: WebSocket;

export let lastTimestamp = Date.now();
export let deltaTime = 0;
export let timeFactor = 0;
export let prevTimestamp = lastTimestamp;

export let interpolatedMouseX = 0;
export let interpolatedMouseY = 0;

export let targetX = 0;
export let targetY = 0;

export let scaleFactor = 1;

export const players: Map<number, EntityPlayer> = new Map();
export const mobs: Map<number, EntityMob> = new Map();

const canvas: HTMLCanvasElement = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

export const cameraController = new CameraController(canvas);

export const uiManager = new UserInterfaceManager(canvas);

(async function () {
    await uiManager.switchUI('menu');

    function showElement(id: string) {
        const element = document.getElementById(id);
        if (element) element.style.display = "block";
    }

    function hideElement(id: string) {
        const element = document.getElementById(id);
        if (element) element.style.display = "none";
    }

    // WebSocket setup
    function connectWebSocket(address: string | URL): Promise<WebSocket> {
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
        ws = await connectWebSocket("ws://" + location.host);
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

    const networking = new Networking(ws);

    // Add all global listeners (interaction)

    let mouseXOffset = 0;
    let mouseYOffset = 0;

    // Mouse move event handler
    canvas.onmousemove = function (event) {
        mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
        mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;
        const distance = Math.hypot(mouseXOffset, mouseYOffset);
        const angle = Math.atan2(mouseYOffset, mouseXOffset);
        networking.sendAngle(angle, distance < 50 ? distance / 100 : 1);
    };

    window.onmousedown = function (e: MouseEvent) {
        if (e.button === 0 || e.button === 2) {
            networking.sendMood(e.button === 0 ? MoodKind.ANGRY : e.button === 2 ? MoodKind.SAD : MoodKind.NORMAL);
        }
    };

    window.onmouseup = function (e: MouseEvent) {
        if (e.button === 0 || e.button === 2) {
            networking.sendMood(MoodKind.NORMAL);
        }
    };

    document.onkeydown = function (e) {
        if (e.type === "keydown") {
            switch (e.code) {
                default: {
                    if (e.code.startsWith("Digit")) {
                        let index = parseInt(e.code.slice(5));
                        if (index === 0) {
                            index = 10;
                        }
                        index--;
                        networking.sendSwapPetal(index);
                    }
                }
            }
        }
    };

    (function animationLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        lastTimestamp = Date.now();
        deltaTime = lastTimestamp - prevTimestamp;
        prevTimestamp = lastTimestamp;
        timeFactor = deltaTime / 33;

        interpolatedMouseX = interpolate(interpolatedMouseX, mouseXOffset, 50);
        interpolatedMouseY = interpolate(interpolatedMouseY, mouseYOffset, 50);

        scaleFactor = Math.max(
            document.documentElement.clientWidth / STANDARD_WIDTH,
            document.documentElement.clientHeight / STANDARD_HEIGHT
        ) * cameraController.zoom;

        const currentUI = uiManager.getCurrentUI();
        if (currentUI) {
            currentUI.animationFrame(animationLoop);
        }
    })();
})();