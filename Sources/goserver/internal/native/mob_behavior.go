package native

type MobBehavior int

const (
	AggressiveBehavior MobBehavior = iota // AggressiveBehavior behave aggressively.
	PassiveBehavior                       // PassiveBehavior behave passively.
	CautionBehavior                       // CautionBehavior behave cautionary.
	NeutralBehavior                       // CautionBehavior behave neutrality.
	NoneBehavior                          // NoneBehavior do nothings.
)

var EachMobBehaviorDefinition = map[MobType]MobBehavior{
	MobTypeBee:    NeutralBehavior,
	MobTypeSpider: AggressiveBehavior,

	MobTypeBeetle:    AggressiveBehavior,
	MobTypeSandstorm: PassiveBehavior,

	MobTypeStarfish:  AggressiveBehavior,
	MobTypeJellyfish: CautionBehavior,
	MobTypeBubble:    PassiveBehavior,
	MobTypeSponge:    PassiveBehavior,

	MobTypeCentipede:       NoneBehavior,
	MobTypeCentipedeDesert: NeutralBehavior,
	MobTypeCentipedeEvil:   AggressiveBehavior,
}
