export default interface WebAssemblyPseudoModule {
    moduleName: keyof WebAssembly.Imports;
    moduleImports: WebAssembly.ModuleImports;
}

export type PseudoModuleFactory = (...arg: PseudoModuleFactoryArguments) => WebAssemblyPseudoModule;

export type PseudoModuleFactoryArguments = [
    // Direct WASM values
    {
        table: WebAssembly.Table;
    },
    // Utility functions
    {
        decodeString(ptr: number, len: number): string;
    },
];