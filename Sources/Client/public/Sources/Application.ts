import type { PseudoModuleFactoryArguments } from "./WebAssembly/Interop/PseudoModules/PseudoModule";
import { createDomApiPseudoModule } from "./WebAssembly/Interop/PseudoModules/DomApiPseudoModule";
import { createEventApiPseudoModule } from "./WebAssembly/Interop/PseudoModules/EventApiPseudoModule";
import { createContextApiPseudoModule } from "./WebAssembly/Interop/PseudoModules/ContextApiPseudoModule";
import { createWebSocketApiPseudoModule } from "./WebAssembly/Interop/PseudoModules/WebSocketApiPseudoModule";
import { createTimerApiPseudoModule } from "./WebAssembly/Interop/PseudoModules/TimerApiPseudoModule";

type FlooooWebAssemblyExports = {
    memory: WebAssembly.Memory;
    __indirect_function_table: WebAssembly.Table;

    main: (argc: number, argv: number) => number;

    // Allocates a memory with n items
    malloc: (size: number) => number;
    // Free a memory at ptr
    free: (ptr: number) => void;
    pollHandle: (socketId: number) => void;
};

const WASM_PATH = "./client.wasm";

const Module: Partial<{
    asm: FlooooWebAssemblyExports;

    HEAP8: Int8Array;
    HEAP16: Int16Array;
    HEAP32: Int32Array;
    HEAPU8: Uint8Array;
    HEAPU16: Uint16Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
    HEAPF64: Float64Array;
}> = {};

export let HEAP8: Int8Array;
export let HEAP16: Int16Array;
export let HEAP32: Int32Array;
export let HEAPU8: Uint8Array;
export let HEAPU16: Uint16Array;
export let HEAPU32: Uint32Array;
export let HEAPF32: Float32Array;
export let HEAPF64: Float64Array;

export let table: WebAssembly.Table;

export let malloc: FlooooWebAssemblyExports["malloc"];
export let free: FlooooWebAssemblyExports["free"];
export let pollHandle: FlooooWebAssemblyExports["pollHandle"];

const textDecoder = new TextDecoder();

function decodeCStringOfBytes(byteArray: Uint8Array, startPos: number, byteLength: number) {
    const endPos = startPos + byteLength;
    let currentPos = startPos;

    for (; byteArray[currentPos] && !(currentPos >= endPos);)
        currentPos++;

    if (16 < currentPos - startPos && byteArray.buffer)
        return textDecoder.decode(byteArray.subarray(startPos, currentPos));

    let decodedString = "";

    while (startPos < currentPos) {
        const byte = byteArray[startPos++];

        if (byte & 128) {
            const byte2 = byteArray[startPos++] & 63;

            if (192 == (byte & 224)) {
                decodedString += String.fromCharCode((byte & 31) << 6 | byte2);
            } else {
                const byte3 = byteArray[startPos++] & 63;

                let codePoint: number;

                if (224 == (byte & 240)) {
                    codePoint = (byte & 15) << 12 | byte2 << 6 | byte3;
                } else {
                    codePoint = (byte & 7) << 18 | byte2 << 12 | byte3 << 6 | byteArray[startPos++] & 63;
                }

                if (65536 > codePoint) {
                    decodedString += String.fromCharCode(codePoint);
                } else {
                    codePoint -= 65536;

                    decodedString += String.fromCharCode(
                        55296 | codePoint >> 10,
                        56320 | codePoint & 1023,
                    );
                }
            }
        } else {
            decodedString += String.fromCharCode(byte);
        }
    }

    return decodedString;
}

export function decodeCString(ptr: number, len?: number): string {
    return ptr
        ? decodeCStringOfBytes(HEAPU8, ptr, len)
        : "";
}

export const decodeString = (ptr: number, len: number): string =>
    textDecoder.decode(HEAPU8.subarray(ptr, ptr + len));

const functionPointerCache: Array<AnyFunction> = [];

export const getWebAssemblyFunction = (ptr: number): AnyFunction => {
    let fn = functionPointerCache[ptr];

    fn || (
        ptr >= functionPointerCache.length && (functionPointerCache.length = ptr + 1),
        functionPointerCache[ptr] = fn = table.get(ptr)
    );

    return fn;
};

const enum ClockId {
    REALTIME,
    MONOTONIC,
    PROCESS_CPU_TIME_ID,
    THREAD_CPU_TIME_ID,
}

type FlooooWebAssemblyInstance = Omit<WebAssembly.Instance, "exports"> & { exports: FlooooWebAssemblyExports };

export type AnyFunction = (...args: Array<any>) => any;

(function () {
    const pseudoModuleFactoryArguments = [
        {},
        {
            decodeString,
            decodeCString,
            getWebAssemblyFunction,
        },
    ] as const satisfies PseudoModuleFactoryArguments;

    const contextApiPseudoModule = createContextApiPseudoModule(...pseudoModuleFactoryArguments);
    const eventApiPseudoModule = createEventApiPseudoModule(...pseudoModuleFactoryArguments);
    const domApiPseudoModule = createDomApiPseudoModule(...pseudoModuleFactoryArguments);
    const webSocketApiPseudoModule = createWebSocketApiPseudoModule(...pseudoModuleFactoryArguments);
    const timerApiPseudoModule = createTimerApiPseudoModule(...pseudoModuleFactoryArguments);

    let stdout: string = "";

    const stdoutWrite = (src: string) => {
        stdout += src;

        for (let i: number; -1 !== (i = stdout.indexOf('\n')); stdout = stdout.slice(i + 1))
            console.log(stdout.slice(0, i));
    };

    const ENOSYS = 28;

    const importObject = {
        wasi_snapshot_preview1: {
            fd_write(fd: number, iovs_ptr: number, iovs_len: number, nwritten_ptr: number): number {
                let nwritten: number = 0;

                for (let iovs_i = 0; iovs_i < iovs_len; iovs_i++) {
                    const iov_ptr = iovs_ptr + iovs_i * 8; // Assuming wasm32

                    const ptr = HEAPU32[iov_ptr >> 2];
                    const len = HEAPU32[(iov_ptr + 4) >> 2];

                    nwritten += len;

                    stdoutWrite(decodeString(ptr, len));
                }

                HEAPU32[nwritten_ptr >> 2] = nwritten;

                return 0;
            },
            fd_close: () => 0,      // Dummy
            fd_fdstat_get: () => 0, // Dummy
            fd_seek: () => 0,       // Dummy
            proc_exit(code: number): void {
                throw "Program terminated with exit(" + code + ")";
            },
            random_get(ptr: number, len: number): number {
                crypto.getRandomValues(HEAPU8.subarray(ptr, ptr + len));

                return 0;
            },

            clock_time_get(clockid: ClockId, precision: number, ptr: number): number {
                const Origin =
                    clockid === ClockId.REALTIME
                        ? Date
                        : performance;

                // Compiler definitely not giving this wrong clockid so this check is pointless
                /*
                let Origin: DateConstructor | Performance;

                switch (clockid) {
                    case ClockId.REALTIME: Origin = Date; break;

                    case ClockId.MONOTONIC:
                    case ClockId.PROCESS_CPU_TIME_ID:
                    case ClockId.THREAD_CPU_TIME_ID: Origin = performance; break;

                    default: return ENOSYS;
                }
                */

                const nowNs: bigint = BigInt(Math.round(Origin.now() * 1_000_000));

                // Store the time value into memory (assumes 64-bit value at ptr)
                const low = Number(nowNs & 0xFFFFFFFFn);
                const high = Number((nowNs >> 32n) & 0xFFFFFFFFn);

                HEAPU32[ptr >> 2] = low;
                HEAPU32[(ptr + 4) >> 2] = high;

                return 0; // Success
            },

            args_get(argv_ptr: number, argv_buf_ptr: number): number { return 0; },
            args_sizes_get(argc_ptr: number, argv_buf_size_ptr: number): number {
                HEAP32[argc_ptr >> 2] = 0;
                HEAP32[argv_buf_size_ptr >> 2] = 0;

                return 0;
            },

            environ_get(environ_ptr: number, environ_buf_ptr: number): number { return 0; },
            environ_sizes_get(environc_ptr: number, environ_buf_size_ptr: number): number {
                HEAP32[environc_ptr >> 2] = 0;
                HEAP32[environ_buf_size_ptr >> 2] = 0;

                return 0;
            },

            fd_prestat_get(fd: number, prestat_ptr: number): number { return ENOSYS; }, // ENOSYS: function not implemented
            fd_prestat_dir_name(fd: number, path_ptr: number, path_len: number): number { return ENOSYS; }, // ENOSYS

            fd_read(fd: number, iovs_ptr: number, iovs_len: number, nread_ptr: number): number {
                HEAP32[nread_ptr >> 2] = 0;

                return 0;
            },
        },

        // Canvas api
        [contextApiPseudoModule.moduleName]: contextApiPseudoModule.moduleImports,

        // Event api
        [eventApiPseudoModule.moduleName]: eventApiPseudoModule.moduleImports,

        // Dom api
        [domApiPseudoModule.moduleName]: domApiPseudoModule.moduleImports,

        // WebSocket api
        [webSocketApiPseudoModule.moduleName]: webSocketApiPseudoModule.moduleImports,

        // Timer api
        [timerApiPseudoModule.moduleName]: timerApiPseudoModule.moduleImports,
    } as const satisfies WebAssembly.Imports;

    function initializeModule(instance: FlooooWebAssemblyInstance) {
        Module.asm = instance.exports;

        const {
            memory: { buffer },
            __indirect_function_table,
            main,
            malloc: wasmMalloc,
            free: wasmFree,
            pollHandle: wasmPollHandle,
        } = Module.asm;

        Module.HEAP8 = HEAP8 = new Int8Array(buffer);
        Module.HEAP16 = HEAP16 = new Int16Array(buffer);
        Module.HEAP32 = HEAP32 = new Int32Array(buffer);
        Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer);
        Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer);
        Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer);
        Module.HEAPF32 = HEAPF32 = new Float32Array(buffer);
        Module.HEAPF64 = HEAPF64 = new Float64Array(buffer);

        table = __indirect_function_table;

        malloc = wasmMalloc;
        free = wasmFree;
        pollHandle = wasmPollHandle;

        const runProgram = () => main(0, 0);

        if (document.readyState === "loading") {
            addEventListener("DOMContentLoaded", runProgram);
        } else {
            runProgram();
        }
    }

    function onSuccess(src: WebAssembly.WebAssemblyInstantiatedSource) {
        initializeModule(src.instance as FlooooWebAssemblyInstance);
    }

    async function fetchWasmBinary() {
        try {
            const response = await fetch(WASM_PATH, {
                credentials: "same-origin",
            });
            if (!response.ok) {
                throw "failed to load wasm binary file at '" + WASM_PATH + "'";
            }

            return await response.arrayBuffer();
        } catch {
            throw "both async and sync fetching of the wasm failed";
        }
    }

    function throwRuntimeError(reason: any) {
        throw new WebAssembly.RuntimeError("Aborted(" + reason + ")" + ". Build with -sASSERTIONS for more info.");
    }

    function fallbackInstantiate(onSuccess: (src: WebAssembly.WebAssemblyInstantiatedSource) => void) {
        return fetchWasmBinary().then(function (binary) {
            return WebAssembly.instantiate(binary, importObject);
        }).then(function (result) {
            return result;
        }).then(onSuccess, function (reason) {
            console.warn("failed to asynchronously prepare wasm: " + reason);

            throwRuntimeError(reason);
        });
    }

    fetch(WASM_PATH, {
        credentials: "same-origin",
    }).then(function (response) {
        return WebAssembly.instantiateStreaming(response, importObject).then(onSuccess, function (error) {
            console.warn("wasm streaming compile failed: " + error);
            console.warn("falling back to ArrayBuffer instantiation");

            return fallbackInstantiate(onSuccess);
        });
    });
})();