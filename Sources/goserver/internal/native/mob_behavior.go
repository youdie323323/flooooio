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
	MobTypeStarfish:  AggressiveBehavior,
	MobTypeBeetle:    AggressiveBehavior,
	MobTypeBubble:    PassiveBehavior,
	MobTypeJellyfish: CautionBehavior,
	MobTypeBee:       NeutralBehavior,
	MobTypeSpider:    AggressiveBehavior,
	MobTypeSponge:    PassiveBehavior,

	MobTypeCentipede:       NoneBehavior,
	MobTypeCentipedeDesert: NeutralBehavior,
	MobTypeCentipedeEvil:   AggressiveBehavior,
}
