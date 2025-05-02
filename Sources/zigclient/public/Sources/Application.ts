import { Canvg, presets } from "canvg";
import { createContextApiPseudoModule } from "./WebAssemblyImports/ContextApiPseudoModule";
import type { PseudoModuleFactoryArguments } from "./WebAssemblyImports/WebAssemblyPseudoModule";
import { createEventApiPseudoModule } from "./WebAssemblyImports/EventApiPseudoModule";

type WasmExports = {
    memory: WebAssembly.Memory;

    init: () => void;
};

(async function () {
    const wasmModule = await WebAssembly.compileStreaming(fetch("./client.wasm"));

    const textDecoder = new TextDecoder();

    const mem = () => {
        // The buffer may change when requesting more memory
        return new DataView(wasmMemory.buffer);
    };

    const decodeString = (ptr: number, len: number): string => textDecoder.decode(new DataView(wasmMemory.buffer, ptr, len));

    const loadSlice = (ptr: number, len: number) => {
        return new Uint8Array(wasmMemory.buffer, ptr, len);
    };

    const table = new WebAssembly.Table({ element: "anyfunc", initial: 14 });

    const pseudoModuleFactoryArguments = [
        {
            table,
        },
        {
            decodeString,
        },
    ] as const satisfies PseudoModuleFactoryArguments;

    const contextApiPseudoModule = createContextApiPseudoModule(...pseudoModuleFactoryArguments);
    const eventApiPseudoModule = createEventApiPseudoModule(...pseudoModuleFactoryArguments);

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

                    console.log(decodeString(ptr, len));
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
        [contextApiPseudoModule.moduleName]: contextApiPseudoModule.moduleImports,

        // Event api
        [eventApiPseudoModule.moduleName]: eventApiPseudoModule.moduleImports,
    }) as { exports: WasmExports };

    if (document.readyState === "loading") {
        addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();