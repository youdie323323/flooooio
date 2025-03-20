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
    [Rarity.COMMON]: "#7F0D7D",  
    [Rarity.UNUSUAL]: "#FFE30D", 
    [Rarity.RARE]: "#4D5563",    
    [Rarity.EPIC]: "#8620BE",    
    [Rarity.LEGENDARY]: "#DE071F",
    [Rarity.MYTHIC]: "#1FDE4E",  
    [Rarity.ULTRA]: "#FF2525", 
} as const satisfies Record<Rarity, ColorCode>;