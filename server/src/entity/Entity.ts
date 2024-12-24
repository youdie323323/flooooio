import { WavePool } from "../wave/WavePool";

/**
 * Create branded type.
 */
export type BrandedId<T extends string> = number & { readonly __brand: T };

export interface Entity {
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

    // TODO: maybe should make setter/getter for size and not to do size fraction every ticks
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

    /**
     * Fraction is the division factor of the size of the scaling that is pre-invoked when drawing. 1 means no scaling.
     */
    fraction: number;

    /**
     * The x, y radius of ellipse. Setting both same value, you can reproduce a circle.
     */
    rx: number;
    ry: number;
}>>;

export type IsEqual<A, B> =
    (<G>() => G extends A ? 1 : 2) extends
    (<G>() => G extends B ? 1 : 2)
    ? true
    : false;

type WritableKeysOf<T> = NonNullable<{
    [P in keyof T]: IsEqual<{ [Q in P]: T[P] }, { readonly [Q in P]: T[P] }> extends false ? P : never
}[keyof T]>;

/**
 * This determines the type of object passed when newing an entity.
 * 
 * @remarks
 * 
 * This type alias is used to filter out keys that are not needed when creating them, such as method/getters.
 * But readonly value are partial'ed too, you may careful with that.
 * 
 * @deprecated Use {@link PartialUnion} now.
 */
export type ConstructorParameterObject<T> = Required<Pick<T, WritableKeysOf<T>>> & Partial<Exclude<T, WritableKeysOf<T>>>;

export type PartialUnion<T, U extends keyof T = never> = Omit<T, U> & Partial<Pick<T, U>>;