import type Entity from "../Entity";

/**
 * Render context per rAF.
 */
export type RenderingContext<T extends Entity> = Readonly<{
    /**
     * Context to render.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * Instance of entity to draw.
     */
    entity: T;

    /**
     * Only render general part of entity.
     */
    isSpecimen: boolean;
}>;