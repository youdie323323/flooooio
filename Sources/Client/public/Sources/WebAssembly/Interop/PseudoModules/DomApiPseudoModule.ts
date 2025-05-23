import type WebAssemblyPseudoModule from "./PseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./PseudoModule";

export const createDomApiPseudoModule = ((...[]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "2",
        moduleImports: {
            0: () => document.documentElement.clientWidth || window.innerWidth,
            1: () => document.documentElement.clientHeight || window.innerHeight,
            
            2: () => devicePixelRatio,
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;