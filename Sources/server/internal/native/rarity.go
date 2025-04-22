package native

type Rarity = uint8

const (
	RarityCommon Rarity = iota
	RarityUnusual
	RarityRare
	RarityEpic
	RarityLegendary
	RarityMythic
	RarityUltra
)

var RarityNames = map[Rarity]string{
	RarityCommon:    "Common",
	RarityUnusual:   "Unusual",
	RarityRare:      "Rare",
	RarityEpic:      "Epic",
	RarityLegendary: "Legendary",
	RarityMythic:    "Mythic",
	RarityUltra:     "Ultra",
}

var RarityColors = map[Rarity]string{
	RarityCommon:    "#7eef6d",
	RarityUnusual:   "#ffe65d",
	RarityRare:      "#4d52e3",
	RarityEpic:      "#861fde",
	RarityLegendary: "#de1f1f",
	RarityMythic:    "#1fdbde",
	RarityUltra:     "#ff2b75",
}
