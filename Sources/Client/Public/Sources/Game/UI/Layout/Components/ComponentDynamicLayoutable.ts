import ExtensionBase from "../Extensions/Extension";
import { Component } from "./Component";
import type { Layoutable } from "./ComponentLayoutable";

export const DYNAMIC_LAYOUTABLE: unique symbol = Symbol("dynamicLayoutable");

/**
 * UI-definable layoutable.
 */
export interface DynamicLayoutable extends Layoutable { readonly [DYNAMIC_LAYOUTABLE]: true }

export abstract class AbstractDynamicLayoutable extends ExtensionBase(Component) implements DynamicLayoutable {
    readonly [DYNAMIC_LAYOUTABLE]: true = true;
}