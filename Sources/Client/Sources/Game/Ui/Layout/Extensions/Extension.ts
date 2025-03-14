import type { Component } from "../Components/Component";
import type { LayoutResult } from "../Layout";

export type UpdateFunction = () => void;

export interface Updatable {
    /**
     * Update method call on rAF frame.
     */
    update: UpdateFunction;
}

/**
 * Base template for abstract extended component class.
 */
export type ComponentExtensionTemplate = Updatable & Record<PropertyKey, any>;

/**
 * Type alias that represent component class, with maybe update method included.
 */
export type ExtensionConstructor = abstract new (...args: ReadonlyArray<any>) =>
    Component &
    // Maybe component is updatable
    Partial<Updatable> &
    {
        calculateLayout(
            width: number,
            height: number,
            originX: number,
            originY: number
        ): LayoutResult;
    };

/**
 * Extension that atleast ensure class has one extension.
 * 
 * @remarks
 * Without mix this class on component, compiler gets error, impossible to mix any extension,
 * so, dont forgot to mixed this extension always when make new component.
 */
export default function ExtensionBase<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        public update: UpdateFunction = () => {
            // Call parent extension update(), so its possible to nest the extension
            super.update?.();
        };
    }

    return MixedBase;
}
