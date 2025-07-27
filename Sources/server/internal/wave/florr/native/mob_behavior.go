package native

type MobBehavior int

const (
	HostileBehavior MobBehavior = iota // AggressiveBehavior behaves aggressively.
	PassiveBehavior                    // PassiveBehavior behaves passively.
	NeutralBehavior                    // NeutralBehavior behaves neutrality.
	ChaoticBehavior                    // ChaoticBehavior behaves chaotic.
)

type MobBehaviorDefinition = map[Rarity]MobBehavior

var fullyPassiveDefinition = MobBehaviorDefinition{
	RarityCommon:    PassiveBehavior,
	RarityUnusual:   PassiveBehavior,
	RarityRare:      PassiveBehavior,
	RarityEpic:      PassiveBehavior,
	RarityLegendary: PassiveBehavior,
	RarityMythic:    PassiveBehavior,
}

var fullyHostileDefinition = MobBehaviorDefinition{
	RarityCommon:    HostileBehavior,
	RarityUnusual:   HostileBehavior,
	RarityRare:      HostileBehavior,
	RarityEpic:      HostileBehavior,
	RarityLegendary: HostileBehavior,
	RarityMythic:    HostileBehavior,
}

var fullyChaoticDefinition = MobBehaviorDefinition{
	RarityCommon:    ChaoticBehavior,
	RarityUnusual:   ChaoticBehavior,
	RarityRare:      ChaoticBehavior,
	RarityEpic:      ChaoticBehavior,
	RarityLegendary: ChaoticBehavior,
	RarityMythic:    ChaoticBehavior,
}

var fullyNeutralDefinition = MobBehaviorDefinition{
	RarityCommon:    NeutralBehavior,
	RarityUnusual:   NeutralBehavior,
	RarityRare:      NeutralBehavior,
	RarityEpic:      NeutralBehavior,
	RarityLegendary: NeutralBehavior,
	RarityMythic:    NeutralBehavior,
}

var EachMobBehaviorDefinition = map[MobType]MobBehaviorDefinition{
	MobTypeBee: {
		RarityCommon:    PassiveBehavior,
		RarityUnusual:   PassiveBehavior,
		RarityRare:      NeutralBehavior,
		RarityEpic:      NeutralBehavior,
		RarityLegendary: NeutralBehavior,
		RarityMythic:    NeutralBehavior,
	},
	MobTypeSpider:     fullyHostileDefinition,
	MobTypeHornet:     fullyHostileDefinition,
	MobTypeBabyAnt:    fullyPassiveDefinition,
	MobTypeWorkerAnt:  fullyNeutralDefinition,
	MobTypeSoldierAnt: fullyHostileDefinition,

	MobTypeBeetle:       fullyHostileDefinition,
	MobTypeSandstorm:    fullyChaoticDefinition,
	MobTypeCactus:       fullyPassiveDefinition,
	MobTypeScorpion:     fullyHostileDefinition,
	MobTypeLadybugShiny: fullyNeutralDefinition,

	MobTypeStarfish:  fullyHostileDefinition,
	MobTypeJellyfish: fullyHostileDefinition,
	MobTypeBubble:    fullyPassiveDefinition,
	MobTypeSponge:    fullyPassiveDefinition,
	MobTypeShell:     fullyNeutralDefinition,
	MobTypeCrab:      fullyHostileDefinition,
	MobTypeLeech:     fullyHostileDefinition,

	MobTypeCentipede: {
		RarityCommon:    PassiveBehavior,
		RarityUnusual:   PassiveBehavior,
		RarityRare:      PassiveBehavior,
		RarityEpic:      NeutralBehavior,
		RarityLegendary: NeutralBehavior,
		RarityMythic:    NeutralBehavior,
	},
	MobTypeCentipedeDesert: fullyPassiveDefinition,
	MobTypeCentipedeEvil:   fullyHostileDefinition,

	// These just placeholder and does nothing
	MobTypeMissileProjectile: fullyPassiveDefinition,
	MobTypeWebProjectile:     fullyPassiveDefinition,
}
