import { MoodKind, PacketKind } from "../shared/packet";
import { STANDARD_WIDTH, STANDARD_HEIGHT, TWO_PI } from "./constants";
import EntityPlayer from "./entity/EntityPlayer";
import CameraController from "./utils/CameraController";
import EntityMob from "./entity/EntityMob";
import { interpolate } from "./utils/Interpolator";
import { Rarities } from "../shared/rarities";
import { UserInterfaceManager } from "./ui/UserInterfaceManager";

export let lastTimestamp = Date.now();
export let deltaTime = 0;
export let timeFactor = 0;
export let prevTimestamp = lastTimestamp;

export let interpolatedMouseX = 0;
export let interpolatedMouseY = 0;

export let targetX = 0;
export let targetY = 0;

export let scaleFactor = 1;

export let selfId = -1;
export const players: Map<number, EntityPlayer> = new Map();
export const mobs: Map<number, EntityMob> = new Map();

(async function () {
    // Canvas setup
    const canvas: HTMLCanvasElement = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');

    const cameraController = new CameraController(canvas);

    const uiManager = UserInterfaceManager.getInstance(canvas);

    await uiManager.switchUI('menu');

    function showElement(id: string) {
        const element = document.getElementById(id);
        if (element) element.style.display = "block";
    }

    function hideElement(id: string) {
        const element = document.getElementById(id);
        if (element) element.style.display = "none";
    }

    let ws: WebSocket;
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
    }

    // Add all global listeners

    let mouseXOffset = 0;
    let mouseYOffset = 0;

    // Mouse move event handler
    canvas.onmousemove = function (event) {
        mouseXOffset = event.clientX - document.documentElement.clientWidth / 2;
        mouseYOffset = event.clientY - document.documentElement.clientHeight / 2;
        const distance = Math.hypot(mouseXOffset, mouseYOffset);
        const angle = Math.atan2(mouseYOffset, mouseXOffset);
        sendAngle(angle, distance < 50 ? distance / 100 : 1);
    };

    window.onmousedown = function (e: MouseEvent) {
        if (e.button === 0 || e.button === 2) {
            sendMood(e.button === 0 ? MoodKind.ANGRY : e.button === 2 ? MoodKind.SAD : MoodKind.NORMAL);
        }
    };

    window.onmouseup = function (e: MouseEvent) {
        if (e.button === 0 || e.button === 2) {
            sendMood(MoodKind.NORMAL);
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
                        sendSwapPetal(index);
                    }
                }
            }
        }
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

    ws.onmessage = (event) => {
        const textDecoder =  new TextDecoder("utf-8");
        function readString(): string {
            const len = data.getUint8(offset++);
            const buffers = new Uint8Array(data.buffer, offset, len);
            const string = textDecoder.decode(buffers);
            offset += len;
            return string;
        }

        const data = new DataView(event.data);
        let offset = 0;
        const kind = data.getUint8(offset++);
        switch (kind) {
            case PacketKind.INIT: {
                selfId = data.getUint32(offset);
                break;
            }
            case PacketKind.UPDATE: {
                const clientCount = data.getUint16(offset);
                offset += 2;

                for (let i = 0; i < clientCount; i++) {
                    const clientId = data.getUint32(offset);
                    offset += 4;

                    const clientX = data.getFloat64(offset);
                    offset += 8;
                    const clientY = data.getFloat64(offset);
                    offset += 8;

                    const clientHp = data.getInt32(offset);
                    offset += 4;

                    const clientSize = data.getUint32(offset);
                    offset += 4;

                    const clientAngle = angleToRad(data.getUint8(offset++));

                    const clientMood = data.getUint8(offset++) as MoodKind;

                    const clientIsDead = !!data.getUint8(offset++);

                    const clientNickname = readString();

                    const clientMaxHealth = data.getInt32(offset);
                    offset += 4;

                    const client = players.get(clientId);
                    if (client) {
                        client.nx = clientX;
                        client.ny = clientY;
                        client.nAngle = clientAngle;
                        client.nSize = clientSize;
                        client.mood = clientMood;
                        client.isDead = clientIsDead;

                        if (clientHp < client.nHealth) {
                            client.redHealthTimer = 1;
                        } else if (clientHp > client.nHealth) {
                            client.redHealthTimer = 0;
                        }

                        if (clientHp < client.nHealth) {
                            client.hurtT = 1;
                        }

                        client.nHealth = clientHp;

                        client.ox = client.x;
                        client.oy = client.y;
                        client.oAngle = client.angle;
                        client.oHealth = client.health;
                        client.oSize = client.size;
                        client.updateT = 0;
                    } else {
                        players.set(clientId, new EntityPlayer(clientId, clientX, clientY, clientSize, clientHp, clientMaxHealth, clientAngle, clientMood, clientNickname));
                    }
                }

                const mobCount = data.getUint16(offset);
                offset += 2;

                let mobIds: Set<number> = new Set();

                for (let i = 0; i < mobCount; i++) {
                    const mobId = data.getUint32(offset);
                    offset += 4;

                    mobIds.add(mobId);

                    const mobX = data.getFloat64(offset);
                    offset += 8;
                    const mobY = data.getFloat64(offset);
                    offset += 8;

                    const mobHp = data.getInt32(offset);
                    offset += 4;

                    const mobSize = data.getUint32(offset);
                    offset += 4;

                    const mobAngle = angleToRad(data.getFloat64(offset));
                    offset += 8;

                    const mobType = data.getUint8(offset++);

                    const mobRarity = data.getUint8(offset++) as Rarities;

                    const mobMaxHealth = data.getInt32(offset);
                    offset += 4;

                    const mobIsPet = !!data.getUint8(offset++);

                    const mob = mobs.get(mobId);
                    if (mob) {
                        mob.nx = mobX;
                        mob.ny = mobY;
                        mob.nAngle = mobAngle;
                        mob.nSize = mobSize;

                        if (mob.health < mob.nHealth) {
                            mob.redHealthTimer = 1;
                        } else if (mob.health > mob.nHealth) {
                            mob.redHealthTimer = 0;
                        }

                        if (mobHp < mob.nHealth) {
                            mob.hurtT = 1;
                        }

                        mob.nHealth = mobHp;

                        mob.ox = mob.x;
                        mob.oy = mob.y;
                        mob.oAngle = mob.angle;
                        mob.oHealth = mob.health;
                        mob.oSize = mob.size;
                        mob.updateT = 0;
                    } else {
                        mobs.set(mobId, new EntityMob(mobId, mobType, mobRarity, mobX, mobY, mobSize, mobHp, mobMaxHealth, mobAngle, mobIsPet));
                    }
                }

                mobs.forEach((mob, key) => {
                    if (!mobIds.has(key)) {
                        mob.isDead = true;
                    }
                });

                break;
            }
        }
    };

    function angleToRad(angle: number) {
        return angle / 255 * TWO_PI;
    }

    function sendAngle(angle: number, magnitude = 1) {
        const normalizedAngle = getNormalizedAngle(angle);
        const data = new Uint8Array([PacketKind.MOVE, normalizedAngle, Math.round(magnitude * 255)]);
        ws.send(data);
    }

    function sendMood(flag: MoodKind) {
        const data = new Uint8Array([PacketKind.MOOD, flag]);
        ws.send(data);
    }

    function sendSwapPetal(index: number) {
        const data = new Uint8Array([PacketKind.SWAP_PETAL, index]);
        ws.send(data);
    }

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

    function getNormalizedAngle(angle: number): number {
        angle %= TWO_PI;
        if (angle < 0) {
            angle += TWO_PI;
        }
        return Math.round(angle / TWO_PI * 255);
    }
})();