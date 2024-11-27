import { Component } from "../Component";

export type UpdateFunction = () => void;

export interface Updatable {
    /**
     * Update method call on rAF.
     */
    update: UpdateFunction;
};

export type ComponentExtensionTemplate = Updatable & { [key: string]: any };

/**
 * Type alias that represent component class, with maybe update method included.
 */
export type ExtensionConstructor = abstract new (...args: any[]) => Component & Partial<Updatable>;

/**
 * Extension that atleast ensure class has one extension.
 * 
 * @remarks
 * 
 * Because need to tell compiler its have update so no need to remove update() from render method.
 */
export default function ExtensionPlaceholder<T extends ExtensionConstructor>(Base: T) {
    abstract class MixedBase extends Base implements ComponentExtensionTemplate {
        public update: UpdateFunction = () => {
            if (typeof super.update === 'function') {
                super.update();
            }
        }
    }

    return MixedBase;
}