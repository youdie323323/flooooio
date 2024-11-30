import { Component } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

export const DYNAMIC_LAYOUTED: unique symbol = Symbol("dynamicLayoutable");

/**
 * Make component dynamic layoutable.
 * 
 * @remarks
 * 
 * Dynamic layoutable means its got layout update every Xfps.
 * To use this extension, must provide layout as function, that return LayoutOptions,
 * to live rendering it.
 */
export function ExtensionDynamicLayoutable<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        // Make sure its public and readable from outside
        public static readonly [DYNAMIC_LAYOUTED] = DYNAMIC_LAYOUTED;

        constructor(...args: any[]) {
            super(...args);
            
            (this as any)[DYNAMIC_LAYOUTED] = true;
        }

        public update: UpdateFunction = () => {
            if (typeof super.update === 'function') {
                super.update();
            }
        }
    }

    return MixedBase;
}