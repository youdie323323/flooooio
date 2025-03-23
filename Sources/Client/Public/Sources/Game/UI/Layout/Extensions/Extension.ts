import type { Component } from "../Components/Component";
import type { Layoutable } from "../Components/ComponentLayoutable";

export type AbstractConstructor<T extends object> = abstract new (...args: ReadonlyArray<any>) => T;

/**
 * Type alias that represent component class, with maybe update method included.
 */
export type ExtensionConstructor = AbstractConstructor<
    Component &
    // Compiler treat super.layout as abstract method and cant call them, so override layoutable methods (abstract methods)
    Layoutable
>;

/**
 * Extension that atleast ensure class has one extension.
 * 
 * @remarks
 * Without mix this class on component, compiler gets error, impossible to mix any extension,
 * so, dont forgot to mixed this extension always when make new component.
 */
export default function ExtensionBase<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base {}

    return MixedBase;
}