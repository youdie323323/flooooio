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
