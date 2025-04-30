type WasmExports = {
    memory: WebAssembly.Memory;

    init: () => void;
};

(async function () {
    const canvasContexts: Array<CanvasRenderingContext2D> = new Array();

    const releasedPathIds: Array<number> = new Array();
    const paths: Array<Path2D> = new Array();

    const wasmModule = await WebAssembly.compileStreaming(fetch("./client.wasm"));
    const memory = new WebAssembly.Memory({ initial: 256 });

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

    const table = new WebAssembly.Table({ initial: 2, element: "anyfunc" });

    const {
        exports: {
            memory: wasmMemory,

            init,
        },
    } = await WebAssembly.instantiate(wasmModule, {
        env: {
            memory,
            __indirect_function_table: table,
            requestAnimationFrame: (callbackPtr: number) => requestAnimationFrame(table.get(callbackPtr)),
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

        0: {
            // Begin canvas api

            0: (width: number, height: number): number => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Failed to get 2D context");

                const contextId = canvasContexts.length;
                canvasContexts.push(ctx);

                return contextId;
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

            2: (contextId: number): void => {
                canvasContexts[contextId].save();
            },

            3: (contextId: number): void => {
                canvasContexts[contextId].restore();
            },

            4: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].translate(x, y);
            },

            5: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].scale(x, y);
            },

            6: (contextId: number, angle: number): void => {
                canvasContexts[contextId].rotate(angle);
            },

            7: (contextId: number): void => {
                canvasContexts[contextId].beginPath();
            },

            8: (contextId: number): void => {
                canvasContexts[contextId].closePath();
            },

            9: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].moveTo(x, y);
            },

            10: (contextId: number, x: number, y: number): void => {
                canvasContexts[contextId].lineTo(x, y);
            },

            11: (contextId: number, ptr: number, length: number): void => {
                canvasContexts[contextId].font = decodeString(ptr, length);
            },

            12: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].fillStyle = decodeString(ptr, len);
            },

            13: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                canvasContexts[contextId].fillText(decodeString(ptr, len), x, y);
            },

            14: (contextId: number): void => {
                canvasContexts[contextId].fill();
            },

            15: (contextId: number, pathId: number, isNonZero: number): void => {
                canvasContexts[contextId].fill(paths[pathId], isNonZero ? "nonzero" : "evenodd");
            },

            16: (contextId: number): void => {
                canvasContexts[contextId].stroke();
            },

            17: (contextId: number, pathId: number): void => {
                canvasContexts[contextId].stroke(paths[pathId]);
            },

            18: (contextId: number): void => {
                canvasContexts[contextId].clip();
            },

            19: (contextId: number, pathId: number): void => {
                canvasContexts[contextId].clip(paths[pathId]);
            },

            20: (contextId: number, width: number): void => {
                canvasContexts[contextId].lineWidth = width;
            },

            21: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].lineCap = decodeString(ptr, len) as CanvasLineCap;
            },

            22: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].strokeStyle = decodeString(ptr, len);
            },

            23: (contextId: number, ptr: number, len: number, x: number, y: number): void => {
                canvasContexts[contextId].strokeText(decodeString(ptr, len), x, y);
            },

            24: (contextId: number, x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): void => {
                canvasContexts[contextId].arc(x, y, radius, startAngle, endAngle, counterclockwise);
            },

            25: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].rect(x, y, width, height);
            },

            26: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].clearRect(x, y, width, height);
            },

            27: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].fillRect(x, y, width, height);
            },

            28: (contextId: number, x: number, y: number, width: number, height: number): void => {
                canvasContexts[contextId].strokeRect(x, y, width, height);
            },

            29: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].textAlign = decodeString(ptr, len) as CanvasTextAlign;
            },

            30: (contextId: number, ptr: number, len: number): void => {
                canvasContexts[contextId].textBaseline = decodeString(ptr, len) as CanvasTextBaseline;
            },

            31: (contextId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
                canvasContexts[contextId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            32: (contextId: number, cpx: number, cpy: number, x: number, y: number): void => {
                canvasContexts[contextId].quadraticCurveTo(cpx, cpy, x, y);
            },

            33: (contextId: number): void => {
                const context = canvasContexts[contextId];
                const canvas = context.canvas;

                context.clearRect(0, 0, canvas.width, canvas.height);
            },

            // End canvas api

            // Begin path2d api

            34: (pathIdToRelease: number) => {
                releasedPathIds.push(pathIdToRelease);

                paths[pathIdToRelease] = null;
            },

            35: () => {
                const newPath = new Path2D;
                if (0 < releasedPathIds.length) {
                    const reusePathId = releasedPathIds.pop();

                    paths[reusePathId] = newPath;

                    return reusePathId;
                }

                paths.push(newPath);

                return paths.length - 1;
            },

            36: (pathId: number, x: number, y: number) => {
                paths[pathId].moveTo(x, y);
            },

            37: (pathId: number, x: number, y: number) => {
                paths[pathId].lineTo(x, y);
            },

            38: (pathId: number, cpx: number, cpy: number, x: number, y: number) => {
                paths[pathId].quadraticCurveTo(cpx, cpy, x, y);
            },

            39: (pathId: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => {
                paths[pathId].bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            },

            40: (pathId: number) => {
                paths[pathId].closePath();
            },

            // End path2d api
        },
    }) as { exports: WasmExports };

    init();
})();