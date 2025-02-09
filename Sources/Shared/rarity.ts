import { ColorCode } from "../Client/Sources/Utils/common";

export enum Rarity {
    Common,
    Unusual,
    Rare,
    Epic,
    Legendary,
    Mythic,
    Ultra,
}

export const NUM_RARITIES = Rarity.Ultra;

export const RARITY_DISPLAY_NAME = {
    [Rarity.Common]: "Common",
    [Rarity.Unusual]: "Unusual",
    [Rarity.Rare]: "Rare",
    [Rarity.Epic]: "Epic",
    [Rarity.Legendary]: "Legendary",
    [Rarity.Mythic]: "Mythic",
    [Rarity.Ultra]: "Ultra",
} satisfies Record<Rarity, string>;

export const RARITY_COLOR = {
    [Rarity.Common]: "#7F0D7D",  
    [Rarity.Unusual]: "#FFE30D", 
    [Rarity.Rare]: "#4D5563",    
    [Rarity.Epic]: "#8620BE",    
    [Rarity.Legendary]: "#DE071F",
    [Rarity.Mythic]: "#1FDE4E",  
    [Rarity.Ultra]: "#FF2525", 
} satisfies Record<Rarity, ColorCode>;