import { WavePool } from "../wave/WavePool";
import { MobId } from "./mob/Mob";
import { PlayerId } from "./player/Player";

/**
 * Create branded type.
 */
export type BrandedId<T extends string> = number & { readonly __brand: T };

export type Entity = {
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

export type MaybeDisposable = Partial<{
    /**
     * Dispose up own mixin values.
     */
    dispose(): void;
}>

export type EntityMixinConstructor<T = {}> = new (...args: any[]) => T & MaybeDisposable;

export interface EntityMixinTemplate extends MaybeDisposable {
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

/**
 * Minimum required data that all mobs/petals data must meet.
 */
export type BaseEntityData = Required<Readonly<{
    name: string;
    description: string;
    fraction: number;
    rx: number;
    ry: number;
}>>;