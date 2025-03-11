import { ColorCode } from "../../Utils/Color";

export const enum Rarity {
    Common,
    Unusual,
    Rare,
    Epic,
    Legendary,
    Mythic,
    Ultra,
}

export const NUM_RARITIES = Rarity.Ultra;

type RarityDisplayName = Capitalize<string>;

export const RARITY_DISPLAY_NAME = {
    [Rarity.Common]: "Common",
    [Rarity.Unusual]: "Unusual",
    [Rarity.Rare]: "Rare",
    [Rarity.Epic]: "Epic",
    [Rarity.Legendary]: "Legendary",
    [Rarity.Mythic]: "Mythic",
    [Rarity.Ultra]: "Ultra",
} as const satisfies Record<Rarity, RarityDisplayName>;

export const RARITY_COLOR = {
    [Rarity.Common]: "#7F0D7D",  
    [Rarity.Unusual]: "#FFE30D", 
    [Rarity.Rare]: "#4D5563",    
    [Rarity.Epic]: "#8620BE",    
    [Rarity.Legendary]: "#DE071F",
    [Rarity.Mythic]: "#1FDE4E",  
    [Rarity.Ultra]: "#FF2525", 
} as const satisfies Record<Rarity, ColorCode>;