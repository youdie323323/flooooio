import { Component, MaybeDynamicLayoutablePointer } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

export const DYNAMIC_LAYOUTED: unique symbol = Symbol("dynamicLayoutable");

/**
 * Make component dynamic layoutable.
 * 
 * @remarks
 * 
 * Dynamic layoutable means layout got updated every rAF frame.
 * To use this extension, must provide layout as pointer {@link MaybeDynamicLayoutablePointer},
 * to live rendering it.
 */
export function ExtensionDynamicLayoutable<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        // Make sure its public and readable from outside
        public static readonly [DYNAMIC_LAYOUTED] = DYNAMIC_LAYOUTED;

        constructor(...args: any[]) {
            super(...args);
            
            this[DYNAMIC_LAYOUTED] = true;
        }

        public update: UpdateFunction = () => {
            if (typeof super.update === 'function') {
                super.update();
            }
        }
    }

    return MixedBase;
}