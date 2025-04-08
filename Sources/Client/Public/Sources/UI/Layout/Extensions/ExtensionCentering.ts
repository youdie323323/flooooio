import { CENTERING } from "../Components/Component";
import type { ExtensionConstructor } from "./Extension";

/**
 * Mark component as blacklist, mean not rendered automatically.
 */
export function Centering<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base {
        // Make sure its public and readable from outside
        public static readonly [CENTERING] = CENTERING;

        constructor(...args: ReadonlyArray<any>) {
            super(...args);
            
            this[CENTERING] = true;
        }
    }

    return MixedBase;
}