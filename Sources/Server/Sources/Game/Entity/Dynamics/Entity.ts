import type { WavePool } from "../../Genres/Wave/WavePool";
import type { MobInstance } from "./Mob/Mob";
import type { PlayerInstance } from "./Player/Player";

/**
 * Create branded type.
 */
export type BrandedId<T extends string> = number & { readonly __brand: T };

export type RealEntity = MobInstance | PlayerInstance;

export interface Entity extends EntityMixinTemplate {
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
     * The health range will be [0, 1] float range.
     */
    health: number;
}

/**
 * Symbols to call in the update method of WavePool.
 */
export const onUpdateTick: unique symbol = Symbol("onUpdateTick");

export type EntityMixinConstructor<T extends object> = new (...args: any[]) => T;

export interface EntityMixinTemplate {
    /**
     * Method call upon every update interval.
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

export type PartialUnion<T, U extends keyof T = never> = Omit<T, U> & Partial<Pick<T, U>>;