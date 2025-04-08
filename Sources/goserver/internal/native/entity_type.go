package native

type MobType = uint8

type PetalType = uint8

const (
	MobTypeBee MobType = iota
	MobTypeSpider

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
