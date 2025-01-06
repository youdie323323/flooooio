import { WavePool } from "../wave/WavePool";
import { MobId } from "./mob/Mob";

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

    [key: PropertyKey]: any;
}

export interface EntityCollision {
    /**
     * Fraction is the division factor of the size of the scaling that is pre-invoked when drawing. 1 means no scaling.
     */
    fraction: number;

    /**
     * The x, y radius of ellipse. Setting both same value, you can reproduce a circle.
     */
    rx: number;
    ry: number;
}

/**
 * Minimum required data that all mobs/petals data must meet.
 */
export interface BaseEntityData<I18n extends object> {
    /**
     * Internationalization of entity data.
     */
    i18n: Required<I18n>;

    /**
     * Collision data needed for collide.
     */
    collision: EntityCollision;
};

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