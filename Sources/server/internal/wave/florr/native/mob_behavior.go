package native

type MobBehavior int

const (
	HostileBehavior MobBehavior = iota // AggressiveBehavior behave aggressively.
	PassiveBehavior                    // PassiveBehavior behave passively.
	NeutralBehavior                    // NeutralBehavior behave neutrality.
	ChaoticBehavior                    // ChaoticBehavior behave chaotic.
)

type RarityMobBehaviorDefinition = map[Rarity]MobBehavior

var fullyPassiveDefinition = RarityMobBehaviorDefinition{
	RarityCommon:    PassiveBehavior,
	RarityUnusual:   PassiveBehavior,
	RarityRare:      PassiveBehavior,
	RarityEpic:      PassiveBehavior,
	RarityLegendary: PassiveBehavior,
	RarityMythic:    PassiveBehavior,
}

var fullyHostileDefinition = RarityMobBehaviorDefinition{
	RarityCommon:    HostileBehavior,
	RarityUnusual:   HostileBehavior,
	RarityRare:      HostileBehavior,
	RarityEpic:      HostileBehavior,
	RarityLegendary: HostileBehavior,
	RarityMythic:    HostileBehavior,
}

var fullyChaoticDefinition = RarityMobBehaviorDefinition{
	RarityCommon:    ChaoticBehavior,
	RarityUnusual:   ChaoticBehavior,
	RarityRare:      ChaoticBehavior,
	RarityEpic:      ChaoticBehavior,
	RarityLegendary: ChaoticBehavior,
	RarityMythic:    ChaoticBehavior,
}

var fullyNeutralDefinition = RarityMobBehaviorDefinition{
	RarityCommon:    NeutralBehavior,
	RarityUnusual:   NeutralBehavior,
	RarityRare:      NeutralBehavior,
	RarityEpic:      NeutralBehavior,
	RarityLegendary: NeutralBehavior,
	RarityMythic:    NeutralBehavior,
}

var EachMobBehaviorDefinition = map[MobType]RarityMobBehaviorDefinition{
	MobTypeBee: {
		RarityCommon:    PassiveBehavior,
		RarityUnusual:   PassiveBehavior,
		RarityRare:      NeutralBehavior,
		RarityEpic:      NeutralBehavior,
		RarityLegendary: NeutralBehavior,
		RarityMythic:    NeutralBehavior,
	},
	MobTypeSpider: fullyHostileDefinition,
	MobTypeHornet: fullyHostileDefinition,

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

	// These is just placeholder and does nothing
	MobTypeMissileProjectile: fullyPassiveDefinition,
	MobTypeWebProjectile:     fullyPassiveDefinition,
}
