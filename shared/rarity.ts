export enum Rarities {
    COMMON,
    UNUSUAL,
    RARE,
    EPIC,
    LEGENDARY,
    MYTHIC,
    ULTRA,
    SUPER
}

export const RARITY_NAME = {
    [Rarities.COMMON]: "Common",
    [Rarities.UNUSUAL]: "Unusual",
    [Rarities.RARE]: "Rare",
    [Rarities.EPIC]: "Epic",
    [Rarities.LEGENDARY]: "Legendary",
    [Rarities.MYTHIC]: "Mythic",
    [Rarities.ULTRA]: "Ultra",
    [Rarities.SUPER]: "Super"
};

export const RARITY_COLOR = {
    [Rarities.COMMON]: "#7F0D7D",  
    [Rarities.UNUSUAL]: "#FFE30D", 
    [Rarities.RARE]: "#4D5563",    
    [Rarities.EPIC]: "#8620BE",    
    [Rarities.LEGENDARY]: "#DE071F",
    [Rarities.MYTHIC]: "#1FDE4E",  
    [Rarities.ULTRA]: "#FF2525",   
    [Rarities.SUPER]: "#2C0523"    
} as const;