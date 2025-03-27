package native

type Biome = byte

const (
	BiomeGarden Biome = iota
	BiomeDesert
	BiomeOcean
)

// BiomeValues represents all biome values
var BiomeValues = []Biome{BiomeGarden, BiomeDesert, BiomeOcean}