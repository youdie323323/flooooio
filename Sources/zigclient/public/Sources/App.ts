import { Canvg, presets } from "canvg";

type WasmExports = {
    memory: WebAssembly.Memory;

    init: () => void;
};

(async function () {
    const canvasContexts: Array<CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D> = new Array();

    const releasedPathIds: Array<number> = new Array();
    const paths: Array<Path2D> = new Array();

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
            setTimeout: (callbackPtr: number, ms: number) => setTimeout(table.get(callbackPtr), ms),
            setInterval: (callbackPtr: number, ms: number) => setInterval(table.get(callbackPtr), ms),
            _throwError(ptr: number, length: number): never {
                const errorMsg = decodeString(ptr, length);
                throw new Error(errorMsg);
            },
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

            0: (width: number, height: number): number => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Failed to get 2D context");

                canvasContexts.push(ctx);

                return canvasContexts.length - 1;
            },

            1: (ptr: number, length: number): number => {
                const canvasId = decodeString(ptr, length);

                const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
                if (!canvas) return -1;

                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Failed to get 2D context");

                canvasContexts.push(ctx);

                return canvasContexts.length - 1;
            },

            2: (ptr: number, length: number, width: number, height: number): number => {
                const svg = decodeString(ptr, length);

                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = width;
                tempCanvas.height = height;
                
                const tempCtx = tempCanvas.getContext("2d");
                if (!tempCtx) throw new Error("Failed to get 2D context");

                Canvg.fromString(tempCtx, svg, presets.offscreen()).render();

                canvasContexts.push(tempCtx);

                return canvasContexts.length - 1;
            },

            3: (contextId: number): void => {
                canvasContexts[contextId].save();
            },

            4: (contextId: number): void => {
                canvasContexts[contextId].restore();
            },

            5: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].translate(x, y);
            },

            6: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].scale(x, y);
            },

            7: (contextId: number, angle: number): void => {
                canvasContexts[contextId].rotate(angle);
            },

            8: (contextId: number): void => {
                canvasContexts[contextId].beginPath();
            },

            9: (contextId: number): void => {
                canvasContexts[contextId].closePath();
            },

            10: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].moveTo(x, y);
            },

            11: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].lineTo(x, y);
            },

            12: (contextId: number, ptr: number, length: number): void => {
                canvasContexts[contextId].font = decodeString(ptr, length);
            },

            13: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].fillStyle = decodeString(ptr, len);
            },

            14: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                canvasContexts[contextId].fillText(decodeString(ptr, len), x, y);
            },

            15: (contextId: number): void => {
                canvasContexts[contextId].fill();
            },

            16: (contextId: number, pathId: number, isNonZero: number): void => {
                canvasContexts[contextId].fill(paths[pathId], isNonZero ? "nonzero" : "evenodd");
            },

            17: (contextId: number): void => {
                canvasContexts[contextId].stroke();
            },

            18: (contextId: number, pathId: number): void => {
                canvasContexts[contextId].stroke(paths[pathId]);
            },

            19: (contextId: number): void => {
                canvasContexts[contextId].clip();
            },

            20: (contextId: number, pathId: number): void => {
                canvasContexts[contextId].clip(paths[pathId]);
            },

            21: (contextId: number, width: number): void => {
                canvasContexts[contextId].lineWidth = width;
            },

            22: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].lineCap = decodeString(ptr, len) as CanvasLineCap;
            },

            23: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].strokeStyle = decodeString(ptr, len);
            },

            24: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                canvasContexts[contextId].strokeText(decodeString(ptr, len), x, y);
            },

            25: (contextId: number, x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): void => {
                canvasContexts[contextId].arc(x, y, radius, startAngle, endAngle, counterclockwise);
            },

            26: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].rect(x, y, width, height);
            },

            27: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].clearRect(x, y, width, height);
            },

            28: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].fillRect(x, y, width, height);
            },

            29: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].strokeRect(x, y, width, height);
            },

            30: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].textAlign = decodeString(ptr, len) as CanvasTextAlign;
            },

            31: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].textBaseline = decodeString(ptr, len) as CanvasTextBaseline;
            },

            32: (contextId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
                canvasContexts[contextId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            33: (contextId: number, cpx: number, cpy: number, x: number, y: number): void => {
                canvasContexts[contextId].quadraticCurveTo(cpx, cpy, x, y);
            },

            34: (dstContextId: number, sourceContextId: number, dx: number, dy: number) => {
                canvasContexts[dstContextId].drawImage(canvasContexts[sourceContextId].canvas, dx, dy);
            },

            35: (dstContextId: number, sourceContextId: number, dx: number, dy: number, dWidth: number, dHeight: number) => {
                canvasContexts[dstContextId].drawImage(canvasContexts[sourceContextId].canvas, dx, dy, dWidth, dHeight);
            },

            36: (contextId: number): void => {
                const context = canvasContexts[contextId];
                const canvas = context.canvas;

                context.clearRect(0, 0, canvas.width, canvas.height);
            },

            // End canvas api

            // Begin path2d api

            37: (pathIdToRelease: number) => {
                releasedPathIds.push(pathIdToRelease);

                paths[pathIdToRelease] = null;
            },

            38: () => {
                const newPath = new Path2D;
                if (0 < releasedPathIds.length) {
                    const reusePathId = releasedPathIds.pop();

                    paths[reusePathId] = newPath;

                    return reusePathId;
                }

                paths.push(newPath);

                return paths.length - 1;
            },

            39: (pathId: number, x: number, y: number) => {
                paths[pathId].moveTo(x, y);
            },

            40: (pathId: number, x: number, y: number) => {
                paths[pathId].lineTo(x, y);
            },

            41: (pathId: number, cpx: number, cpy: number, x: number, y: number) => {
                paths[pathId].quadraticCurveTo(cpx, cpy, x, y);
            },

            42: (pathId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
                paths[pathId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            43: (pathId: number) => {
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