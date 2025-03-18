import type { Component } from "../Components/Component";
import type { LayoutContext, LayoutResult } from "../Layout";

export interface Updatable {
    /**
     * Update method call on rAF frame.
     */
    update(): void;
}

/**
 * Base template for abstract extended component class.
 */
export type ComponentExtensionTemplate = Updatable & Record<PropertyKey, any>;

export interface Layoutable {
    /**
     * Calculate layout result from layout context.
     */
    layout(lc: LayoutContext): LayoutResult;

    /**
     * Method for invalidate cache, this method should invalidate children cache too.
     */
    invalidateLayoutCache(): void;
}

/**
 * Type alias that represent component class, with maybe update method included.
 */
export type ExtensionConstructor = abstract new (...args: ReadonlyArray<any>) =>
    Component &
    // Compiler treat super.layout as abstract method and cant call them
    Layoutable &
    // Maybe component is updatable
    Partial<Updatable>;

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
            return (): void => {
                // Call parent extension update(), so its possible to nest the extension
                super.update?.();
            };
        }
    }

    return MixedBase;
}