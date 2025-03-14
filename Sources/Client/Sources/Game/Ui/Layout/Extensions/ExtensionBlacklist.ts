import type { ComponentExtensionTemplate, ExtensionConstructor, UpdateFunction } from "./Extension";

export const BLACKLISTED: unique symbol = Symbol("blacklisted");

/**
 * Mark component as blacklist, mean not renderer automatically.
 */
export function Blacklist<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        // Make sure its public and readable from outside
        public static readonly [BLACKLISTED] = BLACKLISTED;

        constructor(...args: any[]) {
            super(...args);
            
            this[BLACKLISTED] = true;
        }

        public update: UpdateFunction = () => {
            super.update?.();
        };
    }

    return MixedBase;
}