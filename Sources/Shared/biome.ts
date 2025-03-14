import type { ColorCode } from "./Utils/Color";

export const enum Biome {
    Garden,
    Desert,
    Ocean,
}

export const BIOME_VALUES = new Set([
    Biome.Garden,
    Biome.Desert,
    Biome.Ocean,
]);

type BiomeDisplayName = Capitalize<string>;

export const BIOME_DISPLAY_NAME = {
    [Biome.Garden]: "Garden",
    [Biome.Desert]: "Desert",
    [Biome.Ocean]: "Ocean",
} as const satisfies Record<Biome, BiomeDisplayName>;

export const BIOME_GAUGE_COLORS = {
    [Biome.Garden]: "#1ea761",
    [Biome.Desert]: "#ecdcb8",
    [Biome.Ocean]: "#4e77a7",
} as const satisfies Record<Biome, ColorCode>;