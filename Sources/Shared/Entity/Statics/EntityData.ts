export interface EntityCollision {
    /**
     * Fraction is the division factor of the size of the scaling that is pre-invoked when drawing. 1 means no scaling.
     */
    fraction: number;

    /**
     * The radius of circle.
     */
    radius: number;
}

/**
 * Minimum required data that all mobs/petals data must meet.
 */
export interface EntityData<I18n extends object> {
    /**
     * Internationalization of entity data.
     */
    i18n: Required<I18n>;

    /**
     * Collision data needed for collide.
     */
    collision: EntityCollision;
}