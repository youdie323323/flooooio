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
	MobTypeLeech

	MobTypeCentipede
	MobTypeCentipedeEvil
	MobTypeCentipedeDesert

	MobTypeMissileProjectile
	MobTypeWebProjectile

	PetalTypeBasic PetalType = iota
	PetalTypeFaster
	PetalTypeEggBeetle
	PetalTypeBubble
	PetalTypeYinYang
	PetalTypeMysteriousStick
	PetalTypeSand
	PetalTypeLightning
	PetalTypeClaw
	PetalTypeFang
	PetalTypeYggdrasil
	PetalTypeWeb
	PetalTypeStinger
	PetalTypeWing
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

	// MobTypeMissileProjectile,
	// MobTypeWebProjectile,
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
	PetalTypeWeb,
	PetalTypeStinger,
	PetalTypeWing,
}
