import Entity from "../Entity";

/**
 * Render context per rAF.
 */
export type RendererRenderingContext<T extends Entity> = Readonly<{
    /**
     * Context to render.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * Instance of entity, to draw.
     */
    entity: T;
}>;