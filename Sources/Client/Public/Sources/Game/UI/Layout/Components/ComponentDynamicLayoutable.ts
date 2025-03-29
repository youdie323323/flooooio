import { Component } from "./Component";
import type { Layoutable } from "./ComponentLayoutable";

export const DYNAMIC_LAYOUTABLE: unique symbol = Symbol("dynamicLayoutable");

/**
 * UI-definable layoutable.
 */
export interface DynamicLayoutable extends Layoutable { readonly [DYNAMIC_LAYOUTABLE]: true }

export abstract class AbstractDynamicLayoutable extends Component implements DynamicLayoutable {
    readonly [DYNAMIC_LAYOUTABLE]: true = true;
}