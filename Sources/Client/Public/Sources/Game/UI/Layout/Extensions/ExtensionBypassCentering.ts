import { BYPASS_CENTERING } from "../Components/Component";
import type { ExtensionConstructor } from "./Extension";

/**
 * Mark component as blacklist, mean not rendered automatically.
 */
export function BypassCentering<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base {
        // Make sure its public and readable from outside
        public static readonly [BYPASS_CENTERING] = BYPASS_CENTERING;

        constructor(...args: any[]) {
            super(...args);
            
            this[BYPASS_CENTERING] = true;
        }
    }

    return MixedBase;
}