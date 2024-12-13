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