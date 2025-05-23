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