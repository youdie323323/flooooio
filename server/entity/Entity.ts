import { WavePool } from "../wave/WavePool";

/**
 * Create branded type.
 * 
 * @remarks
 * 
 * Use branded type to avoid mistaking WaveRoomPlayer id and Entity id.
 */
export type BrandedId<T extends string> = number & { __brand: T };

export type EntityId = BrandedId<"Entity">;

export interface Entity {
    /**
     * Id of entity.
     * 
     * @readonly
     */
    readonly id: EntityId;

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
     * Max health of entity.
     * 
     * @readonly
     */
    maxHealth: number;
}

/**
 * Symbols to call in the update method of WavePool
 * 
 * @remarks
 * 
 * This is not only used for mixin.
 */
export const onUpdateTick: unique symbol = Symbol.for("onUpdateTick");

export type MaybeFreeable = Partial<{
    /**
     * Free up own mixin values.
     */
    free(): void;
}>

export type EntityMixinConstructor<T = {}> = new (...args: any[]) => T & MaybeFreeable;

export interface EntityMixinTemplate extends MaybeFreeable {
    /**
     * Method call up to every UPDATE_FPS interval.
     * 
     * @remarks
     * 
     * Call this method of parent if exists so can propagate mixin.
     */
    [onUpdateTick]: (poolThis: WavePool) => void;

    [key: string | number | symbol]: any;
}