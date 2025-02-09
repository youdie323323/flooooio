import { ColorCode } from "../Client/Sources/Utils/common";

export enum Biome {
    Garden,
    Desert,
    Ocean,
}

export const BIOME_VALUES = Object.values(Biome);

export function biomeToCapitalizedBiomeString(biome: Biome): string {
    const biomeText = Biome[biome];
    return biomeText[0].toUpperCase() + biomeText.slice(1).toLowerCase();
}

export const WAVE_BIOME_GAUGE_COLORS = {
    [Biome.Garden]: "#1ea761",
    [Biome.Desert]: "#ecdcb8",
    [Biome.Ocean]: "#4e77a7",
} satisfies Record<Biome, ColorCode>;