import { WavePool } from "../../Genres/Wave/WavePool";

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

    /**
     * Current size of entity.
     */
    size: number;

    /**
     * Current health of entity.
     * 
     * @remarks
     * 
     * The health range will be [0, 1] float range.
     */
    health: number;
}

/**
 * Symbols to call in the update method of WavePool.
 * 
 * @remarks
 * 
 * This is not only used for mixin.
 */
export const onUpdateTick: unique symbol = Symbol("onUpdateTick");

export type EntityMixinConstructor<T extends object> = new (...args: any[]) => T & EntityMixinTemplate;

export interface EntityMixinTemplate {
    /**
     * Method call upon every UPDATE_FPS interval.
     * 
     * @remarks
     * 
     * Call this method of parent if exists so can propagate mixin.
     */
    [onUpdateTick](poolThis: WavePool): void;

    /**
     * Dispose up own mixin values.
     */
    dispose(): void;
}

/**
 * Union typeof EntityMixinTemplate.
 */
export type UnderlyingMixinUnion = keyof EntityMixinTemplate;

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
export type ConstructorParameterObject<T, P extends WritableKeysOf<T>, U extends P = P> = Required<Pick<T, U>> & Partial<Exclude<T, U>>;

export type PartialUnion<T, U extends keyof T = never> = Omit<T, U> & Partial<Pick<T, U>>;