package native

type Biome = byte

const (
	BiomeGarden Biome = iota
	BiomeDesert
	BiomeOcean
)

var BiomeValues = []Biome{BiomeGarden, BiomeDesert, BiomeOcean}