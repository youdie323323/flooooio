import { PETAL_PROFILES } from "../../shared/petalProfiles";
import { MobType, PetalType } from "../../shared/types";

// Ill implements util function here because server-side source leak

export function isPetal(type: MobType | PetalType): boolean {
    return type in PETAL_PROFILES;
}

// #00000030
export const darkendBase = 0.1875;

/**
 * Darkens colour 
 * @param color color code
 * @param strength strenth
 */
export function darkend(color: string, strength: number) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.floor(r * (1 - strength));
    g = Math.floor(g * (1 - strength));
    b = Math.floor(b * (1 - strength));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}