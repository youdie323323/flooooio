package native

type MobType = uint8

type PetalType = uint8

const (
	MobTypeBee MobType = iota
	MobTypeSpider

	MobTypeBeetle

	MobTypeStarfish
	MobTypeJellyfish
	MobTypeBubble
	MobTypeSponge

	MobTypeCentipede
	MobTypeCentipedeEvil
	MobTypeCentipedeDesert

	PetalTypeBasic PetalType = iota
	PetalTypeFaster
	PetalTypeEggBeetle
	PetalTypeBubble
	PetalTypeYinYang
)

var MobTypeValues = []MobType{
	MobTypeBee,
	MobTypeSpider,

	MobTypeBeetle,

	MobTypeStarfish,
	MobTypeJellyfish,
	MobTypeBubble,
	MobTypeSponge,

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
}
