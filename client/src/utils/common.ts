import { PETAL_PROFILES } from "../../../shared/entity/mob/petal/petalProfiles";
import { MobType, PetalType } from "../../../shared/EntityType";
import { memo } from "../../../shared/utils/memoize";

export const isPetal = memo((type: MobType | PetalType): type is PetalType => {
    return type in PETAL_PROFILES;
});

// #00000030
export const DARKEND_BASE = 0.1875;

/**
 * Type alias that represents color code.
 */
export type ColorCode = `#${string}${string}${string}`;

/**
 * Darkens colour.
 * @param color - Color code.
 * @param strength - Strenth.
 */
export const darkend = memo((color: ColorCode, strength: number): ColorCode => {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.floor(r * (1 - strength));
    g = Math.floor(g * (1 - strength));
    b = Math.floor(b * (1 - strength));

    const result: ColorCode = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return result;
});