import { ColorCode } from "../client/src/utils/common";

export enum Biomes {
    GARDEN,
    DESERT,
    OCEAN,
}

export const BIOME_VALUES = Object.values(Biomes);

export function biomeToCapitalizedBiomeString(biome: Biomes): string {
    const biomeText = Biomes[biome];
    return biomeText[0].toUpperCase() + biomeText.slice(1).toLowerCase();
}

export const WAVE_BIOME_GAUGE_COLORS = {
    [Biomes.GARDEN]: "#1ea761",
    [Biomes.DESERT]: "#ecdcb8",
    [Biomes.OCEAN]: "#4e77a7",
} satisfies Record<Biomes, ColorCode>;