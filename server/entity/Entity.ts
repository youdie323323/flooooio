export interface Entity {
    /**
     * Id of entity, cant be changed.
     */
    readonly id: number;

    /**
     * Current x-pos of entity.
     */
    x: number;
    /**
     * Current y-pos of entity.
     */
    y: number;

    /**
     * Current magnitude of entity.
     */
    magnitude: number;
    /**
     * Current angle of entity.
     */
    angle: number;

    /**
     * Current size of entity.
     */
    size: number;

    /**
     * Current health of entity.
     */
    health: number;
    /**
     * Max health of entity, immutable.
     */
    readonly maxHealth: number;
}

/**
 * Symbol that call on 60 frame per second.
 */
export const onUpdateTick: symbol = Symbol.for("onUpdateTick");