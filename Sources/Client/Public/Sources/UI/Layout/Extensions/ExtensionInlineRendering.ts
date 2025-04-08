import type { ExtensionConstructor } from "./Extension";

export const BLACKLISTED: unique symbol = Symbol("blacklisted");

/**
 * Mark component as blacklist, mean not rendered automatically.
 */
export function InlineRendering<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base {
        // Make sure its public and readable from outside
        public static readonly [BLACKLISTED] = BLACKLISTED;

        constructor(...args: ReadonlyArray<any>) {
            super(...args);
            
            this[BLACKLISTED] = true;
        }
    }

    return MixedBase;
}