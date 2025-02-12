import Entity from "../Entity";

/**
 * Render context per rAF.
 */
export type RenderContext<T extends Entity> = Readonly<{
    /**
     * Context to render.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * Instance of entity, to draw.
     */
    entity: T;
}>;