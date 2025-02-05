import { ColorCode } from "../Client/Sources/Utils/common";

export enum Biomes {
    Garden,
    Desert,
    Ocean,
}

export const BIOME_VALUES = Object.values(Biomes);

export function biomeToCapitalizedBiomeString(biome: Biomes): string {
    const biomeText = Biomes[biome];
    return biomeText[0].toUpperCase() + biomeText.slice(1).toLowerCase();
}

export const WAVE_BIOME_GAUGE_COLORS = {
    [Biomes.Garden]: "#1ea761",
    [Biomes.Desert]: "#ecdcb8",
    [Biomes.Ocean]: "#4e77a7",
} satisfies Record<Biomes, ColorCode>;