import type { AnyFunction } from "../../../Application";

export default interface WebAssemblyPseudoModule {
    moduleName: keyof WebAssembly.Imports;
    moduleImports: WebAssembly.ModuleImports;
}

export type PseudoModuleFactory = (...arg: PseudoModuleFactoryArguments) => WebAssemblyPseudoModule;

export type PseudoModuleFactoryArguments = [
    // Direct WASM values
    Readonly<{
        // This can passed if imported table from JS side, but currently exporting table from wasm
        // table: WebAssembly.Table;
    }>,
    // Utility functions
    Readonly<{
        decodeString(ptr: number, len: number): string;
        decodeCString(ptr: number, len?: number): string;
        getWebAssemblyFunction(ptr: number): AnyFunction;
    }>,
];