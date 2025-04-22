package native

type MobBehavior int

const (
	AggressiveBehavior MobBehavior = iota // AggressiveBehavior behave aggressively.
	PassiveBehavior                       // PassiveBehavior behave passively.
	CautionBehavior                       // CautionBehavior behave cautionary.
	NeutralBehavior                       // NeutralBehavior behave neutrality.
	ChaoticBehavior                       // ChaoticBehavior behave chaotic.
	VoidBehavior                          // NoneBehavior do nothings.
)

var EachMobBehaviorDefinition = map[MobType]MobBehavior{
	MobTypeBee:    NeutralBehavior,
	MobTypeSpider: AggressiveBehavior,
	MobTypeHornet: CautionBehavior,

	MobTypeBeetle:       AggressiveBehavior,
	MobTypeSandstorm:    ChaoticBehavior,
	MobTypeCactus:       PassiveBehavior,
	MobTypeScorpion:     AggressiveBehavior,
	MobTypeLadybugShiny: NeutralBehavior,

	MobTypeStarfish:  AggressiveBehavior,
	MobTypeJellyfish: CautionBehavior,
	MobTypeBubble:    PassiveBehavior,
	MobTypeSponge:    PassiveBehavior,
	MobTypeShell:     PassiveBehavior,
	MobTypeCrab:      AggressiveBehavior,

	MobTypeCentipede:       VoidBehavior,
	MobTypeCentipedeDesert: NeutralBehavior,
	MobTypeCentipedeEvil:   AggressiveBehavior,

	MobTypeMissile: VoidBehavior,
}
