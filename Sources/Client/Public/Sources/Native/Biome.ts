import type { ColorCode } from "../../../Public/Sources/Utils/Color";

export const enum Biome {
    GARDEN,
    DESERT,
    OCEAN,
}

type BiomeDisplayName = Capitalize<string>;

export const BIOME_DISPLAY_NAME = {
    [Biome.GARDEN]: "Garden",
    [Biome.DESERT]: "Desert",
    [Biome.OCEAN]: "Ocean",
} as const satisfies Record<Biome, BiomeDisplayName>;

export const BIOME_GAUGE_COLORS = {
    [Biome.GARDEN]: "#1ea761",
    [Biome.DESERT]: "#ecdcb8",
    [Biome.OCEAN]: "#4e77a7",
} as const satisfies Record<Biome, ColorCode>;