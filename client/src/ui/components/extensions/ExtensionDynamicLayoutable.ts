import { Component, MaybeDynamicLayoutablePointer } from "../Component";
import { ComponentExtensionTemplate, ExtensionConstructor, Updatable, UpdateFunction } from "./Extension";

export const DYNAMIC_LAYOUTED: unique symbol = Symbol("dynamicLayouted");

/**
 * Mark component as dynamic layoutable.
 * 
 * @remarks
 * 
 * Only top-level components can applied this.
 */
export function DynamicLayoutableExtension<T extends ExtensionConstructor>(Base: T) {
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