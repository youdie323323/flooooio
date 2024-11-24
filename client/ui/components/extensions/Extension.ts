import { Component } from "../Component";

export type UpdateFunction = () => void;

export type ComponentExtensionTemplate = Updatable & {
    [key: string]: any;
}

export interface Updatable {
    /**
     * Update method call on rAF.
     */
    update: UpdateFunction;
}

export type ExtensionConstructor = new (...args: any[]) => Component & Partial<Updatable>;

/**
 * Extension that atleast ensure class has one extension.
 * 
 * @remarks
 * 
 * Because need to tell compiler its have update so no need to remove update() from render method.
 */
export default function ExtensionEmpty<T extends ExtensionConstructor>(Base: T) {
    return class extends Base implements ComponentExtensionTemplate {
        public update: UpdateFunction = () => {
            if (typeof super.update === 'function') {
                super.update();
            }
        }
    };
}