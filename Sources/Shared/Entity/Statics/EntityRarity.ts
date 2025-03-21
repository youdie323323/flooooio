import type { ColorCode } from "../../Utils/Color";

export const enum Rarity {
    COMMON,
    UNUSUAL,
    RARE,
    EPIC,
    LEGENDARY,
    MYTHIC,
    ULTRA,
}

export const kMaxRarities = 7 as const;

type RarityDisplayName = Capitalize<string>;

export const RARITY_DISPLAY_NAME = {
    [Rarity.COMMON]: "Common",
    [Rarity.UNUSUAL]: "Unusual",
    [Rarity.RARE]: "Rare",
    [Rarity.EPIC]: "Epic",
    [Rarity.LEGENDARY]: "Legendary",
    [Rarity.MYTHIC]: "Mythic",
    [Rarity.ULTRA]: "Ultra",
} as const satisfies Record<Rarity, RarityDisplayName>;

export const RARITY_COLOR = {
    [Rarity.COMMON]: "#7eef6d",  
    [Rarity.UNUSUAL]: "#ffe65d", 
    [Rarity.RARE]: "#4d52e3",    
    [Rarity.EPIC]: "#861fde",    
    [Rarity.LEGENDARY]: "#de1f1f",
    [Rarity.MYTHIC]: "#1fdbde",  
    [Rarity.ULTRA]: "#ff2b75", 
} as const satisfies Record<Rarity, ColorCode>;