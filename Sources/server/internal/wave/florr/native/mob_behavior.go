package native

type MobBehavior int

const (
	MobHostileBehavior MobBehavior = iota // AggressiveBehavior behaves aggressively.
	MobPassiveBehavior                    // PassiveBehavior behaves passively.
	MobNeutralBehavior                    // NeutralBehavior behaves neutrality.
	MobChaoticBehavior                    // ChaoticBehavior behaves chaotic.
)

type MobRarityBehavior = map[Rarity]MobBehavior

var mobFullPassiveBehavior = MobRarityBehavior{
	RarityCommon:    MobPassiveBehavior,
	RarityUnusual:   MobPassiveBehavior,
	RarityRare:      MobPassiveBehavior,
	RarityEpic:      MobPassiveBehavior,
	RarityLegendary: MobPassiveBehavior,
	RarityMythic:    MobPassiveBehavior,
}

var mobFullHostileBehavior = MobRarityBehavior{
	RarityCommon:    MobHostileBehavior,
	RarityUnusual:   MobHostileBehavior,
	RarityRare:      MobHostileBehavior,
	RarityEpic:      MobHostileBehavior,
	RarityLegendary: MobHostileBehavior,
	RarityMythic:    MobHostileBehavior,
}

var mobFullChaoticBehavior = MobRarityBehavior{
	RarityCommon:    MobChaoticBehavior,
	RarityUnusual:   MobChaoticBehavior,
	RarityRare:      MobChaoticBehavior,
	RarityEpic:      MobChaoticBehavior,
	RarityLegendary: MobChaoticBehavior,
	RarityMythic:    MobChaoticBehavior,
}

var mobFullNeutralBehavior = MobRarityBehavior{
	RarityCommon:    MobNeutralBehavior,
	RarityUnusual:   MobNeutralBehavior,
	RarityRare:      MobNeutralBehavior,
	RarityEpic:      MobNeutralBehavior,
	RarityLegendary: MobNeutralBehavior,
	RarityMythic:    MobNeutralBehavior,
}

var MobBehaviors = map[MobType]MobRarityBehavior{
	MobTypeBee: {
		RarityCommon:    MobPassiveBehavior,
		RarityUnusual:   MobPassiveBehavior,
		RarityRare:      MobNeutralBehavior,
		RarityEpic:      MobNeutralBehavior,
		RarityLegendary: MobNeutralBehavior,
		RarityMythic:    MobNeutralBehavior,
	},
	MobTypeSpider:     mobFullHostileBehavior,
	MobTypeHornet:     mobFullHostileBehavior,
	MobTypeBabyAnt:    mobFullPassiveBehavior,
	MobTypeWorkerAnt:  mobFullNeutralBehavior,
	MobTypeSoldierAnt: mobFullHostileBehavior,

	MobTypeBeetle:       mobFullHostileBehavior,
	MobTypeSandstorm:    mobFullChaoticBehavior,
	MobTypeCactus:       mobFullPassiveBehavior,
	MobTypeScorpion:     mobFullHostileBehavior,
	MobTypeLadybugShiny: mobFullNeutralBehavior,

	MobTypeStarfish:  mobFullHostileBehavior,
	MobTypeJellyfish: mobFullHostileBehavior,
	MobTypeBubble:    mobFullPassiveBehavior,
	MobTypeSponge:    mobFullPassiveBehavior,
	MobTypeShell:     mobFullNeutralBehavior,
	MobTypeCrab:      mobFullHostileBehavior,
	MobTypeLeech:     mobFullHostileBehavior,

	MobTypeCentipede: {
		RarityCommon:    MobPassiveBehavior,
		RarityUnusual:   MobPassiveBehavior,
		RarityRare:      MobPassiveBehavior,
		RarityEpic:      MobNeutralBehavior,
		RarityLegendary: MobNeutralBehavior,
		RarityMythic:    MobNeutralBehavior,
	},
	MobTypeCentipedeDesert: mobFullPassiveBehavior,
	MobTypeCentipedeEvil:   mobFullHostileBehavior,

	// These just placeholder and does nothing
	MobTypeMissileProjectile: mobFullPassiveBehavior,
	MobTypeWebProjectile:     mobFullPassiveBehavior,
}
