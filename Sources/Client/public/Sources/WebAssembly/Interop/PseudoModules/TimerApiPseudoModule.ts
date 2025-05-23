import type WebAssemblyPseudoModule from "./PseudoModule";
import type { PseudoModuleFactory, PseudoModuleFactoryArguments } from "./PseudoModule";

export const createTimerApiPseudoModule = ((...[, { getWebAssemblyFunction }]: PseudoModuleFactoryArguments): WebAssemblyPseudoModule => {
    return {
        moduleName: "4",
        moduleImports: {
            0: (functionRefPtr: number, delay: number) =>
                setInterval(getWebAssemblyFunction(functionRefPtr), delay),
            1: (functionRefPtr: number, delay: number) =>
                setTimeout(getWebAssemblyFunction(functionRefPtr), delay),

            2: (id: number) => clearInterval(id),
            3: (id: number) => clearTimeout(id),
        },
    } as const satisfies WebAssemblyPseudoModule;
}) satisfies PseudoModuleFactory;