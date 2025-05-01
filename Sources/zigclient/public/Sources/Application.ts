import { Canvg, presets } from "canvg";

type WasmExports = {
    memory: WebAssembly.Memory;

    init: () => void;
};

interface CanvasLostRestoreMethod {
    // Context lost
    Jj: () => void;
    // Context restore
    Kj: () => void;
}

declare global {
    interface HTMLCanvasElement extends CanvasLostRestoreMethod { }
    interface OffscreenCanvas extends CanvasLostRestoreMethod { }
}

function toHexCharCode(nibble: number) {
    switch (nibble) {
        case 0:
            return 48;

        case 1:
            return 49;

        case 2:
            return 50;

        case 3:
            return 51;

        case 4:
            return 52;

        case 5:
            return 53;

        case 6:
            return 54;

        case 7:
            return 55;

        case 8:
            return 56;

        case 9:
            return 57;

        case 10:
            return 65;

        case 11:
            return 66;

        case 12:
            return 67;

        case 13:
            return 68;

        case 14:
            return 69;

        case 15:
            return 70;

        default:
            return 63;
    }
}

const LINE_DASH_REAL_LINE: Iterable<number> = [];

type Uint1 = 0 | 1;

(async function () {
    const contexts: Array<CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D> = new Array();
    const destroyedContextIds: Array<number> = new Array();

    const paths: Array<Path2D> = new Array();
    const destroyedPathIds: Array<number> = new Array();

    const wasmModule = await WebAssembly.compileStreaming(fetch("./client.wasm"));

    const textDecoder = new TextDecoder();

    const logLine: Array<number> = new Array();

    const mem = () => {
        // The buffer may change when requesting more memory
        return new DataView(wasmMemory.buffer);
    };

    const decodeString = (ptr: number, len: number): string => textDecoder.decode(new DataView(wasmMemory.buffer, ptr, len));

    const loadSlice = (ptr: number, len: number) => {
        return new Uint8Array(wasmMemory.buffer, ptr, len);
    };

    const table = new WebAssembly.Table({ element: "anyfunc", initial: 14 });

    const {
        exports: {
            memory: wasmMemory,

            init,
        },
    } = await WebAssembly.instantiate(wasmModule, {
        env: {
            __indirect_function_table: table,
            requestAnimationFrame: (callbackPtr: number) => requestAnimationFrame(table.get(callbackPtr)),
        },

        wasi_snapshot_preview1: {
            fd_write(fd: number, iovs_ptr: number, iovs_len: number, nwritten_ptr: number): number {
                let nwritten = 0;

                for (let iovs_i = 0; iovs_i < iovs_len; iovs_i++) {
                    const iov_ptr = iovs_ptr + iovs_i * 8; // Assuming wasm32

                    const ptr = mem().getUint32(iov_ptr + 0, true);
                    const len = mem().getUint32(iov_ptr + 4, true);

                    nwritten += len;

                    for (let i = 0; i < len; i++) logLine.push(mem().getUint8(ptr + i));

                    // Write line
                    const line = textDecoder.decode(new Uint8Array(logLine));

                    logLine.length = 0;

                    console.log(line);
                }

                mem().setUint32(nwritten_ptr, nwritten, true);

                return 0;
            },
            fd_close: () => 0,      // Dummy
            fd_fdstat_get: () => 0, // Dummy
            fd_seek: () => 0,       // Dummy
            proc_exit(code: number): void {
                throw "Program terminated with exit(" + code + ")";
            },
            random_get(ptr: number, len: number): number {
                crypto.getRandomValues(loadSlice(ptr, len));

                return 0;
            },
        },

        // Canvas api
        0: {
            // Begin canvas api

            0: (w: number, h: number, isDiscardable: Uint1): number => {
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext("2d", {
                    storage:
                        isDiscardable
                            ? "discardable"
                            : "persistent",
                }) as CanvasRenderingContext2D | null;
                if (!ctx) throw new Error("Failed to get 2D context");

                let contextId: number;

                if (0 < destroyedContextIds.length) {
                    contextId = destroyedContextIds.pop();

                    contexts[contextId] = ctx;
                } else {
                    contextId = contexts.length;

                    contexts.push(ctx);
                }

                canvas.Jj = function () { };
                canvas.Kj = function () { };

                return contextId;
            },

            1: (ptr: number, len: number, alpha: Uint1): number => {
                const canvas = document.getElementById(decodeString(ptr, len)) as HTMLCanvasElement | null;
                if (!canvas) return -1;

                const ctx = canvas.getContext("2d", {
                    alpha: !!alpha,
                });
                if (!ctx) throw new Error("Failed to get 2D context");

                contexts.push(ctx);

                return contexts.length - 1;
            },

            2: (contextId: number, ptr: number, len: number): void =>
                Canvg.fromString(
                    contexts[contextId],
                    decodeString(ptr, len),
                    presets.offscreen(),
                ).render(),

            3: (contextId: number): void => {
                const canvas = contexts[contextId].canvas;

                destroyedContextIds.push(contextId);

                delete canvas.Jj;
                delete canvas.Kj;

                canvas.width = canvas.height = 0;

                contexts[contextId] = null;
            },

            4: (contextId: number): void => {
                contexts[contextId].save();
            },

            5: (contextId: number): void => {
                contexts[contextId].restore();
            },

            6: (contextId: number): void => {
                contexts[contextId].setTransform(1, 0, 0, 1, 0, 0);
            },

            7: (contextId: number, a: number, b: number, c: number, d: number, e: number, f: number): void => {
                contexts[contextId].setTransform(a, b, c, d, e, f);
            },

            8: (contextId: number): void => {
                contexts[contextId].fill();
            },

            9: (contextId: number, pathId: number, isNonZero: number): void => {
                contexts[contextId].fill(paths[pathId], isNonZero ? "nonzero" : "evenodd");
            },

            10: (contextId: number): void => {
                contexts[contextId].stroke();
            },

            11: (contextId: number, pathId: number): void => {
                contexts[contextId].stroke(paths[pathId]);
            },

            12: (contextId: number): void => {
                contexts[contextId].clip();
            },

            13: (contextId: number, pathId: number): void => {
                contexts[contextId].clip(paths[pathId]);
            },

            14: (contextId: number): void => {
                contexts[contextId].beginPath();
            },

            15: (contextId: number): void => {
                contexts[contextId].closePath();
            },

            16: (contextId: number, x: number, y: number, w: number, h: number): void => {
                contexts[contextId].rect(x, y, w, h);
            },

            17: (contextId: number): void => {
                const context = contexts[contextId];
                const canvas = context.canvas;

                context.clearRect(0, 0, canvas.width, canvas.height);
            },

            18: (contextId: number, x: number, y: number, w: number, h: number): void => {
                contexts[contextId].clearRect(x, y, w, h);
            },

            // Draw a pixel
            19: (contextId: number): void => {
                contexts[contextId].fillRect(0, 0, 1, 1);
            },

            20: (contextId: number, w: number, h: number): void => {
                contexts[contextId].strokeRect(0, 0, w, h);
            },

            21: (contextId: number, r: number, g: number, b: number) => {
                contexts[contextId].fillStyle = String.fromCharCode(
                    35,
                    toHexCharCode(r >> 4 & 15),
                    toHexCharCode(r & 15),
                    toHexCharCode(g >> 4 & 15),
                    toHexCharCode(g & 15),
                    toHexCharCode(b >> 4 & 15),
                    toHexCharCode(b & 15),
                );
            },

            22: (contextId: number, r: number, g: number, b: number) => {
                contexts[contextId].strokeStyle = String.fromCharCode(
                    35,
                    toHexCharCode(r >> 4 & 15),
                    toHexCharCode(r & 15),
                    toHexCharCode(g >> 4 & 15),
                    toHexCharCode(g & 15),
                    toHexCharCode(b >> 4 & 15),
                    toHexCharCode(b & 15),
                );
            },

            23: (contextId: number, alpha: number) => {
                contexts[contextId].globalAlpha = alpha;
            },

            24: (contextId: number, x: number, y: number): void => {
                contexts[contextId].moveTo(x, y);
            },

            25: (contextId: number, x: number, y: number): void => {
                contexts[contextId].lineTo(x, y);
            },

            26: (contextId: number, x: number, y: number): void => {
                contexts[contextId].translate(x, y);
            },

            27: (contextId: number, x: number, y: number): void => {
                contexts[contextId].scale(x, y);
            },

            28: (contextId: number, angle: number): void => {
                contexts[contextId].rotate(angle);
            },

            29: (contextId: number, cpx: number, cpy: number, x: number, y: number): void => {
                contexts[contextId].quadraticCurveTo(cpx, cpy, x, y);
            },

            30: (contextId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
                contexts[contextId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            31: (contextId: number, x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: Uint1): void => {
                contexts[contextId].arc(x, y, radius, startAngle, endAngle, !!counterclockwise);
            },

            32: (contextId: number, x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise: Uint1): void => {
                contexts[contextId].ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, !!counterclockwise);
            },

            33: (contextId: number, w: number): void => {
                contexts[contextId].lineWidth = w;
            },

            34: (dstContextId: number, srcContextId: number, dx: number, dy: number) => {
                contexts[dstContextId].drawImage(contexts[srcContextId].canvas, dx, dy);
            },
            
            35: (dstContextId: number, srcContextId: number, dx: number, dy: number) => {
                contexts[dstContextId].drawImage(contexts[srcContextId].canvas, dx, dy, 1, 1);
            },

            36: (dstContextId: number, srcContextId: number, dx: number, dy: number, dw: number, dh: number) => {
                contexts[dstContextId].drawImage(contexts[srcContextId].canvas, dx, dy, dw, dh);
            },

            37: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                contexts[contextId].fillText(decodeString(ptr, len), x, y);
            },

            38: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                contexts[contextId].strokeText(decodeString(ptr, len), x, y);
            },

            39: (contextId: number, pixel: number) => {
                contexts[contextId].font = "700 " + pixel + "px Game, Microsoft YaHei, sans-serif";
            },

            40: (contextId: number) => {
                contexts[contextId].textAlign = "center";
            },

            41: (contextId: number, ptr: number, len: number): void => {
                contexts[contextId].textAlign = decodeString(ptr, len) as CanvasTextAlign;
            },

            42: (contextId: number) => {
                contexts[contextId].lineCap = "butt";
            },

            43: (contextId: number) => {
                contexts[contextId].lineCap = "round";
            },

            44: (contextId: number) => {
                contexts[contextId].lineCap = "square";
            },

            45: (contextId: number) => {
                contexts[contextId].lineJoin = "round";
            },

            46: (contextId: number) => {
                contexts[contextId].lineJoin = "miter";
            },

            47: (contextId: number, miterLimit: number) => {
                contexts[contextId].miterLimit = miterLimit;
            },

            48: (contextId: number) => {
                contexts[contextId].setLineDash(LINE_DASH_REAL_LINE);
            },

            49: (contextId: number, lineDashOffset: number) => {
                contexts[contextId].lineDashOffset = lineDashOffset;
            },

            50: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "source-over";
            },

            51: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "destination-in";
            },

            52: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "copy";
            },

            53: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "lighter";
            },

            54: (contextId: number) => {
                contexts[contextId].globalCompositeOperation = "multiply";
            },

            55: (contextId: number, smoothing: Uint1) => {
                contexts[contextId].imageSmoothingEnabled = !!smoothing;
            },

            // End canvas api

            // Begin path2d api

            56: (pathIdToRelease: number) => {
                destroyedPathIds.push(pathIdToRelease);

                paths[pathIdToRelease] = null;
            },

            57: () => {
                const newPath = new Path2D;
                if (0 < destroyedPathIds.length) {
                    const reusePathId = destroyedPathIds.pop();

                    paths[reusePathId] = newPath;

                    return reusePathId;
                }

                paths.push(newPath);

                return paths.length - 1;
            },

            58: (pathId: number, x: number, y: number) => {
                paths[pathId].moveTo(x, y);
            },

            59: (pathId: number, x: number, y: number) => {
                paths[pathId].lineTo(x, y);
            },

            60: (pathId: number, cpx: number, cpy: number, x: number, y: number) => {
                paths[pathId].quadraticCurveTo(cpx, cpy, x, y);
            },

            61: (pathId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
                paths[pathId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            62: (pathId: number) => {
                paths[pathId].closePath();
            },

            // End path2d api
        },

        // EventTarget api
        1: {
            0: (elementIdPtr: number, elementIdLength: number, eventTypePtr: number, eventTypeLength: number, callbackPtr: number): void => {
                const elementId = decodeString(elementIdPtr, elementIdLength);
                const eventType = decodeString(eventTypePtr, eventTypeLength);

                const element = elementId ? document.getElementById(elementId) : window;
                if (!element) throw new Error("Could not find element");

                element.addEventListener(eventType, table.get(callbackPtr));
            },

            1: (elementIdPtr: number, elementIdLength: number, eventTypePtr: number, eventTypeLength: number, callbackPtr: number): void => {
                const elementId = decodeString(elementIdPtr, elementIdLength);
                const eventType = decodeString(eventTypePtr, eventTypeLength);

                const element = elementId ? document.getElementById(elementId) : window;
                if (!element) throw new Error("Could not find element");

                element.removeEventListener(eventType, table.get(callbackPtr));
            },

            2: (elementIdPtr: number, elementIdLength: number, keyPtr: number, keyLength: number, value: number): void => {
                const elementId = decodeString(elementIdPtr, elementIdLength);
                const key = decodeString(keyPtr, keyLength);

                const element = document.getElementById(elementId);
                if (!element) throw new Error("Could not find element");

                element[key] = value;
            },

            3: (elementIdPtr: number, elementIdLength: number, keyPtr: number, keyLength: number): number => {
                const elementId = decodeString(elementIdPtr, elementIdLength);
                const key = decodeString(keyPtr, keyLength);

                const element = document.getElementById(elementId);
                if (!element) throw new Error("Could not find element");

                return Number(element[key]);
            },
        },
    }) as { exports: WasmExports };

    if (document.readyState === "loading") {
        addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();