import type { PseudoModuleFactoryArguments } from "./WebassemblyInterop/PseudoModules/WebAssemblyPseudoModule";
import { createDomApiPseudoModule } from "./WebassemblyInterop/PseudoModules/DomApiPseudoModule";
import { createEventApiPseudoModule } from "./WebassemblyInterop/PseudoModules/EventApiPseudoModule";
import { createContextApiPseudoModule } from "./WebassemblyInterop/PseudoModules/ContextApiPseudoModule";
import FontDetect from "./Utils/FontDetect";
import { createWebSocketApiPseudoModule } from "./WebassemblyInterop/PseudoModules/WebSocketApiPseudoModule";

type WasmExports = {
    memory: WebAssembly.Memory;
    __indirect_function_table: WebAssembly.Table;

    __main: () => void;

    // Allocates a memory with n items
    __alloc: (n: number) => number;
    // Free a memory at ptr
    __free: (ptr: number, n: number) => void;
    __pollHandle: (socketId: number) => void;
};

const WASM_PATH = "./client.wasm";

const Module: Partial<{
    asm: WasmExports;

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

export let alloc: WasmExports["__alloc"];
export let free: WasmExports["__free"];
export let pollHandle: WasmExports["__pollHandle"];

type FlooooWebassemblyInstance = Omit<WebAssembly.Instance, "exports"> & { exports: WasmExports };

let isFontsLoaded = false;

function ensureFontsLoaded() {
    (isFontsLoaded = FontDetect.isFontLoaded("Game", "aA0") && FontDetect.isFontLoaded("Game", "\u69fd\u4f4d") && FontDetect.isFontLoaded("Game", "\u88c5\u5099"))
        ? console.log("Fonts loaded")
        : window.requestAnimationFrame(ensureFontsLoaded);
}

(function () {
    ensureFontsLoaded();

    const textDecoder = new TextDecoder();

    const decodeString = (ptr: number, len: number): string => textDecoder.decode(HEAPU8.subarray(ptr, ptr + len));

    const pseudoModuleFactoryArguments = [
        {},
        {
            decodeString,
        },
    ] as const satisfies PseudoModuleFactoryArguments;

    const contextApiPseudoModule = createContextApiPseudoModule(...pseudoModuleFactoryArguments);
    const eventApiPseudoModule = createEventApiPseudoModule(...pseudoModuleFactoryArguments);
    const domApiPseudoModule = createDomApiPseudoModule(...pseudoModuleFactoryArguments);
    const webSocketApiPseudoModule = createWebSocketApiPseudoModule(...pseudoModuleFactoryArguments);

    const importObject = {
        wasi_snapshot_preview1: {
            fd_write(fd: number, iovs_ptr: number, iovs_len: number, nwritten_ptr: number): number {
                let nwritten = 0;

                for (let iovs_i = 0; iovs_i < iovs_len; iovs_i++) {
                    const iov_ptr = iovs_ptr + iovs_i * 8; // Assuming wasm32

                    const ptr = HEAPU32[iov_ptr >> 2];
                    const len = HEAPU32[(iov_ptr + 4) >> 2];

                    nwritten += len;

                    console.log(decodeString(ptr, len));
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

            fd_prestat_get(fd: number, prestat_ptr: number): number { return 28; }, // ENOSYS: function not implemented
            fd_prestat_dir_name(fd: number, path_ptr: number, path_len: number): number { return 28; }, // ENOSYS

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
    } as const satisfies WebAssembly.Imports;

    function initializeModule(instance: FlooooWebassemblyInstance) {
        Module.asm = instance.exports;

        const {
            memory: { buffer },
            __indirect_function_table,
            __main: main,
            __alloc: wasmAlloc,
            __free: wasmFree,
            __pollHandle: wasmPollHandle,
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

        alloc = wasmAlloc;
        free = wasmFree;
        pollHandle = wasmPollHandle;

        if (document.readyState === "loading") {
            addEventListener("DOMContentLoaded", main);
        } else {
            main();
        }
    }

    function onSuccess(src: WebAssembly.WebAssemblyInstantiatedSource) {
        initializeModule(src.instance as FlooooWebassemblyInstance);
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

    function throwRuntimeError(message: any) {
        throw new WebAssembly.RuntimeError("Aborted(" + message + ")" + ". Build with -sASSERTIONS for more info.");
    }

    function fallbackInstantiate(onSuccess: (src: WebAssembly.WebAssemblyInstantiatedSource) => void) {
        return fetchWasmBinary().then(function (binary) {
            return WebAssembly.instantiate(binary, importObject);
        }).then(function (result) {
            return result;
        }).then(onSuccess, function (error) {
            console.warn("failed to asynchronously prepare wasm: " + error);

            throwRuntimeError(error);
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