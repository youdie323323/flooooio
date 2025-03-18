import type { ComponentExtensionTemplate, ExtensionConstructor } from "./Extension";

export const BLACKLISTED: unique symbol = Symbol("blacklisted");

/**
 * Mark component as blacklist, mean not rendered automatically.
 */
export function InlineRenderingCall<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        // Make sure its public and readable from outside
        public static readonly [BLACKLISTED] = BLACKLISTED;

        constructor(...args: any[]) {
            super(...args);
            
            this[BLACKLISTED] = true;
        }

        override get update(): ComponentExtensionTemplate["update"] {
            return (): void => {
                // Call parent extension update(), so its possible to nest the extension
                super.update?.();
            };
        }
    }

    return MixedBase;
}