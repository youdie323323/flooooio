package native

type MobType = uint8

type PetalType = uint8

const (
	MobTypeBee MobType = iota
	MobTypeSpider
	MobTypeHornet

	MobTypeBeetle
	MobTypeSandstorm
	MobTypeCactus
	MobTypeScorpion
	MobTypeLadybugShiny

	MobTypeStarfish
	MobTypeJellyfish
	MobTypeBubble
	MobTypeSponge
	MobTypeShell
	MobTypeCrab

	MobTypeCentipede
	MobTypeCentipedeEvil
	MobTypeCentipedeDesert

	MobTypeMissile
	
	PetalTypeBasic PetalType = iota
	PetalTypeFaster
	PetalTypeEggBeetle
	PetalTypeBubble
	PetalTypeYinYang
	PetalTypeStick
	PetalTypeSand
	PetalTypeLightning
	PetalTypeClaw
	PetalTypeFang
	PetalTypeYggdrasil
)

var MobTypeValues = []MobType{
	MobTypeBee,
	MobTypeSpider,
	MobTypeHornet,

	MobTypeBeetle,
	MobTypeSandstorm,
	MobTypeCactus,
	MobTypeScorpion,
	MobTypeLadybugShiny,

	MobTypeStarfish,
	MobTypeJellyfish,
	MobTypeBubble,
	MobTypeSponge,
	MobTypeShell,
	MobTypeCrab,

	MobTypeCentipede,
	MobTypeCentipedeEvil,
	MobTypeCentipedeDesert,
	
	// MobTypeMissile,
}

var PetalTypeValues = []PetalType{
	PetalTypeBasic,
	PetalTypeFaster,
	PetalTypeEggBeetle,
	PetalTypeBubble,
	PetalTypeYinYang,
	PetalTypeSand,
	PetalTypeLightning,
	PetalTypeClaw,
	PetalTypeFang,
	PetalTypeYggdrasil,
}
