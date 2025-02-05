import { ColorCode } from "../Client/Sources/Utils/common";

export enum Rarities {
    Common,
    Unusual,
    Rare,
    Epic,
    Legendary,
    Mythic,
    Ultra,
}

export const NUM_RARITIES = Rarities.Ultra;

export const RARITY_DISPLAY_NAME = {
    [Rarities.Common]: "Common",
    [Rarities.Unusual]: "Unusual",
    [Rarities.Rare]: "Rare",
    [Rarities.Epic]: "Epic",
    [Rarities.Legendary]: "Legendary",
    [Rarities.Mythic]: "Mythic",
    [Rarities.Ultra]: "Ultra",
} satisfies Record<Rarities, string>;

export const RARITY_COLOR = {
    [Rarities.Common]: "#7F0D7D",  
    [Rarities.Unusual]: "#FFE30D", 
    [Rarities.Rare]: "#4D5563",    
    [Rarities.Epic]: "#8620BE",    
    [Rarities.Legendary]: "#DE071F",
    [Rarities.Mythic]: "#1FDE4E",  
    [Rarities.Ultra]: "#FF2525", 
} satisfies Record<Rarities, ColorCode>;