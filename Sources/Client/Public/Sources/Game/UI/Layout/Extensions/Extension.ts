import UITitlePlayerProfile from "../../Title/UITitlePlayerProfile";
import type { Component } from "../Components/Component";
import { AbstractDynamicLayoutable } from "../Components/ComponentDynamicLayoutable";
import type { Layoutable } from "../Components/ComponentLayoutable";

export interface Updatable {
    /**
     * Update method call on rAF frame.
     */
    update(ctx: CanvasRenderingContext2D): void;
}

/**
 * Base template for abstract extended component class.
 */
export type ComponentExtensionTemplate = Updatable & Record<PropertyKey, any>;

export type AbstractConstructor<T extends object> = abstract new (...args: ReadonlyArray<any>) => T;

/**
 * Type alias that represent component class, with maybe update method included.
 */
export type ExtensionConstructor = AbstractConstructor<
    Component &
    // Compiler treat super.layout as abstract method and cant call them, so override layoutable methods (abstract methods)
    Layoutable &
    // Maybe component is updatable
    Partial<Updatable>
>;

/**
 * Extension that atleast ensure class has one extension.
 * 
 * @remarks
 * Without mix this class on component, compiler gets error, impossible to mix any extension,
 * so, dont forgot to mixed this extension always when make new component.
 */
export default function ExtensionBase<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        public get update(): ComponentExtensionTemplate["update"] {
            return (ctx: CanvasRenderingContext2D): void => {
                // Call parent extension update(), so its possible to nest the extension
                super.update?.(ctx);
            };
        }
    }

    return MixedBase;
}