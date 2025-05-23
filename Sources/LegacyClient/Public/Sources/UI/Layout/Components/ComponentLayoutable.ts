import type { LayoutContext, LayoutResult } from "../Layout";

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