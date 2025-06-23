package native

import (
	"encoding/json"
	"os"
)

type MobI18n struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type MobStat struct {
	Health     float32 `json:"health"`
	BodyDamage float32 `json:"bodyDamage"`

	// Maybe this should bee any but ok now
	Extra EntityExtra `json:"extra,omitempty"`
}

// GetDamage returns damage within MobStat.
func (s MobStat) GetDamage() float32 {
	return s.BodyDamage
}

type MobData struct {
	EntityData[MobI18n]

	BaseSize float32 `json:"baseSize"`

	// Bit fancy... :(
	Common    MobStat `json:"0"`
	Unusual   MobStat `json:"1"`
	Rare      MobStat `json:"2"`
	Epic      MobStat `json:"3"`
	Legendary MobStat `json:"4"`
	Mythic    MobStat `json:"5"`
	Ultra     MobStat `json:"6"`
}

func (d MobData) StatFromRarity(r Rarity) MobStat {
	switch r {
	case RarityCommon:
		return d.Common

	case RarityUnusual:
		return d.Unusual

	case RarityRare:
		return d.Rare

	case RarityEpic:
		return d.Epic

	case RarityLegendary:
		return d.Legendary

	case RarityMythic:
		return d.Mythic

	default:
		return d.Common
	}
}

var MobProfiles = map[MobType]MobData{
	MobTypeBee: {
		Common: MobStat{
			Health:     15,
			BodyDamage: 50,
		},
		Unusual: MobStat{
			Health:     24,
			BodyDamage: 55,
		},
		Rare: MobStat{
			Health:     37.5,
			BodyDamage: 65,
		},
		Epic: MobStat{
			Health:     60,
			BodyDamage: 80,
		},
		Legendary: MobStat{
			Health:     375,
			BodyDamage: 100,
		},
		Mythic: MobStat{
			Health:     750,
			BodyDamage: 125,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Bee",
				Description: "It stings. Don't touch it.",
			},
			Collision: EntityCollision{
				Fraction: 30,
				Radius:   25,
			},
		},
	},
	MobTypeSpider: {
		Common: MobStat{
			Health:     25,
			BodyDamage: 25,
		},
		Unusual: MobStat{
			Health:     40,
			BodyDamage: 27.5,
		},
		Rare: MobStat{
			Health:     62.5,
			BodyDamage: 32.5,
		},
		Epic: MobStat{
			Health:     100,
			BodyDamage: 40,
		},
		Legendary: MobStat{
			Health:     625,
			BodyDamage: 50,
		},
		Mythic: MobStat{
			Health:     1250,
			BodyDamage: 62.5,
		},
		BaseSize: 15,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Spider",
				Description: "Spooky.",
			},
			Collision: EntityCollision{
				Fraction: 25,
				Radius:   45,
			},
		},
	},
	MobTypeHornet: {
		Common: MobStat{
			Health:     40,
			BodyDamage: 50,
		},
		Unusual: MobStat{
			Health:     64,
			BodyDamage: 55,
		},
		Rare: MobStat{
			Health:     100,
			BodyDamage: 65,
		},
		Epic: MobStat{
			Health:     160,
			BodyDamage: 80,
		},
		Legendary: MobStat{
			Health:     1000,
			BodyDamage: 100,
		},
		Mythic: MobStat{
			Health:     2000,
			BodyDamage: 125,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Hornet",
				Description: "These aren't quite as nice as the little bees.",
			},
			Collision: EntityCollision{
				Fraction: 25,
				Radius:   20,
			},
		},
	},
	MobTypeBabyAnt: {
		Common: MobStat{
			Health:     10,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     16,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     25,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     40,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     250,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     500,
			BodyDamage: 25,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Baby Ant",
				Description: "Fuck you.",
			},
			Collision: EntityCollision{
				Fraction: 30,
				Radius:   20,
			},
		},
	},
	MobTypeWorkerAnt: {
		Common: MobStat{
			Health:     25,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     40,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     62.5,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     100,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     625,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     1250,
			BodyDamage: 25,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Worker Ant",
				Description: "Fuck you.",
			},
			Collision: EntityCollision{
				Fraction: 30,
				Radius:   20,
			},
		},
	},
	MobTypeBeetle: {
		Common: MobStat{
			Health:     40,
			BodyDamage: 30,
		},
		Unusual: MobStat{
			Health:     64,
			BodyDamage: 33,
		},
		Rare: MobStat{
			Health:     100,
			BodyDamage: 39,
		},
		Epic: MobStat{
			Health:     160,
			BodyDamage: 48,
		},
		Legendary: MobStat{
			Health:     1000,
			BodyDamage: 60,
		},
		Mythic: MobStat{
			Health:     2000,
			BodyDamage: 75,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Beetle",
				Description: "It's hungry and flowers are its favorite meal.",
			},
			Collision: EntityCollision{
				Fraction: 40,
				Radius:   40,
			},
		},
	},
	MobTypeSandstorm: {
		Common: MobStat{
			Health:     50,
			BodyDamage: 40,
		},
		Unusual: MobStat{
			Health:     80,
			BodyDamage: 44,
		},
		Rare: MobStat{
			Health:     125,
			BodyDamage: 52,
		},
		Epic: MobStat{
			Health:     200,
			BodyDamage: 64,
		},
		Legendary: MobStat{
			Health:     1250,
			BodyDamage: 80,
		},
		Mythic: MobStat{
			Health:     2500,
			BodyDamage: 100,
		},
		BaseSize: 40,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Sandstorm",
				Description: "Darude (1999)",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   25,
			},
		},
	},
	MobTypeCactus: {
		Common: MobStat{
			Health:     30,
			BodyDamage: 30,
		},
		Unusual: MobStat{
			Health:     48,
			BodyDamage: 33,
		},
		Rare: MobStat{
			Health:     75,
			BodyDamage: 39,
		},
		Epic: MobStat{
			Health:     120,
			BodyDamage: 48,
		},
		Legendary: MobStat{
			Health:     750,
			BodyDamage: 60,
		},
		Mythic: MobStat{
			Health:     1500,
			BodyDamage: 75,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Cactus",
				Description: "Avoid touching it, it hurts",
			},
			Collision: EntityCollision{
				Fraction: 30,
				Radius:   36,
			},
		},
	},
	MobTypeScorpion: {
		Common: MobStat{
			Health:     60,
			BodyDamage: 10,

			Extra: EntityExtra{
				"totalPoison": 50,
				"poisonDPS":   15,
			},
		},
		Unusual: MobStat{
			Health:     96,
			BodyDamage: 11,

			Extra: EntityExtra{
				"totalPoison": 55,
				"poisonDPS":   16.5,
			},
		},
		Rare: MobStat{
			Health:     150,
			BodyDamage: 13,

			Extra: EntityExtra{
				"totalPoison": 65,
				"poisonDPS":   19.5,
			},
		},
		Epic: MobStat{
			Health:     240,
			BodyDamage: 16,

			Extra: EntityExtra{
				"totalPoison": 80,
				"poisonDPS":   24,
			},
		},
		Legendary: MobStat{
			Health:     1500,
			BodyDamage: 20,

			Extra: EntityExtra{
				"totalPoison": 100,
				"poisonDPS":   30,
			},
		},
		Mythic: MobStat{
			Health:     3000,
			BodyDamage: 25,

			Extra: EntityExtra{
				"totalPoison": 125,
				"poisonDPS":   37.5,
			},
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Scorpion",
				Description: "IT STINGS",
			},
			Collision: EntityCollision{
				Fraction: 30,
				Radius:   27.5,
			},
		},
	},
	MobTypeLadybugShiny: {
		Common: MobStat{
			Health:     35,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     56,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     87.5,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     140,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     875,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     1750,
			BodyDamage: 25,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Shiny Ladybug",
				Description: "Shiny, cute and mostly harmless.",
			},
			Collision: EntityCollision{
				Fraction: 30,
				Radius:   30,
			},
		},
	},
	MobTypeStarfish: {
		Common: MobStat{
			Health:     60,
			BodyDamage: 20,
		},
		Unusual: MobStat{
			Health:     96,
			BodyDamage: 22,
		},
		Rare: MobStat{
			Health:     150,
			BodyDamage: 26,
		},
		Epic: MobStat{
			Health:     240,
			BodyDamage: 32,
		},
		Legendary: MobStat{
			Health:     1500,
			BodyDamage: 40,
		},
		Mythic: MobStat{
			Health:     3000,
			BodyDamage: 50,
		},
		BaseSize: 20,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Starfish",
				Description: "His name is Patrick",
			},
			Collision: EntityCollision{
				Fraction: 120,
				Radius:   100,
			},
		},
	},
	MobTypeJellyfish: {
		Common: MobStat{
			Health:     50,
			BodyDamage: 25,

			Extra: EntityExtra{
				"lightning": 7,
				"bounces":   1,
			},
		},
		Unusual: MobStat{
			Health:     80,
			BodyDamage: 27.5,

			Extra: EntityExtra{
				"lightning": 7.7,
				"bounces":   2,
			},
		},
		Rare: MobStat{
			Health:     125,
			BodyDamage: 32.5,

			Extra: EntityExtra{
				"lightning": 9.1,
				"bounces":   3,
			},
		},
		Epic: MobStat{
			Health:     200,
			BodyDamage: 40,

			Extra: EntityExtra{
				"lightning": 11.2,
				"bounces":   4,
			},
		},
		Legendary: MobStat{
			Health:     1250,
			BodyDamage: 50,

			Extra: EntityExtra{
				"lightning": 14,
				"bounces":   5,
			},
		},
		Mythic: MobStat{
			Health:     2500,
			BodyDamage: 62.5,

			Extra: EntityExtra{
				"lightning": 17.5,
				"bounces":   10,
			},
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Jellyfish",
				Description: "Makes the most delicious jam.",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   20,
			},
		},
	},
	MobTypeBubble: {
		Common: MobStat{
			Health:     5,
			BodyDamage: 5,
		},
		Unusual: MobStat{
			Health:     8,
			BodyDamage: 5.5,
		},
		Rare: MobStat{
			Health:     12.5,
			BodyDamage: 6.5,
		},
		Epic: MobStat{
			Health:     20,
			BodyDamage: 8,
		},
		Legendary: MobStat{
			Health:     125,
			BodyDamage: 10,
		},
		Mythic: MobStat{
			Health:     250,
			BodyDamage: 12.5,
		},
		BaseSize: 40,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Bubble",
				Description: "Pop",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   20,
			},
		},
	},
	MobTypeSponge: {
		Common: MobStat{
			Health:     40,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     64,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     100,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     160,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     1000,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     2000,
			BodyDamage: 25,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Sponge",
				Description: "Bob",
			},
			Collision: EntityCollision{
				Fraction: 25,
				Radius:   35,
			},
		},
	},
	MobTypeShell: {
		Common: MobStat{
			Health:     90,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     144,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     225,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     360,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     2250,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     4500,
			BodyDamage: 25,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Shell",
				Description: "Not an advertisement.",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   30,
			},
		},
	},
	MobTypeCrab: {
		Common: MobStat{
			Health:     80,
			BodyDamage: 25,
		},
		Unusual: MobStat{
			Health:     128,
			BodyDamage: 27.5,
		},
		Rare: MobStat{
			Health:     200,
			BodyDamage: 32.5,
		},
		Epic: MobStat{
			Health:     320,
			BodyDamage: 40,
		},
		Legendary: MobStat{
			Health:     2000,
			BodyDamage: 50,
		},
		Mythic: MobStat{
			Health:     4000,
			BodyDamage: 62.5,
		},
		BaseSize: 30,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Crab",
				Description: "Mr. Crab",
			},
			Collision: EntityCollision{
				Fraction: 25,
				Radius:   20,
			},
		},
	},
	MobTypeLeech: {
		Common: MobStat{
			Health:     70,
			BodyDamage: 10,

			Extra: EntityExtra{
				"lifesteal": 7,
			},
		},
		Unusual: MobStat{
			Health:     112,
			BodyDamage: 11,

			Extra: EntityExtra{
				"lifesteal": 7.7,
			},
		},
		Rare: MobStat{
			Health:     175,
			BodyDamage: 13,

			Extra: EntityExtra{
				"lifesteal": 9.1,
			},
		},
		Epic: MobStat{
			Health:     280,
			BodyDamage: 16,

			Extra: EntityExtra{
				"lifesteal": 11.2,
			},
		},
		Legendary: MobStat{
			Health:     1750,
			BodyDamage: 20,

			Extra: EntityExtra{
				"lifesteal": 14,
			},
		},
		Mythic: MobStat{
			Health:     3500,
			BodyDamage: 25,

			Extra: EntityExtra{
				"lifesteal": 17.5,
			},
		},
		BaseSize: 12.5,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Leech",
				Description: "Slurp slurp.",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   12.5,
			},
		},
	},
	MobTypeCentipede: {
		Common: MobStat{
			Health:     50,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     80,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     125,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     200,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     1250,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     2500,
			BodyDamage: 25,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Centipede",
				Description: "It's just there doing its thing.",
			},
			Collision: EntityCollision{
				Fraction: 35,
				Radius:   35,
			},
		},
	},
	MobTypeCentipedeEvil: {
		Common: MobStat{
			Health:     50,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     80,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     125,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     200,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     1250,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     2500,
			BodyDamage: 25,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Centipede",
				Description: "This one loves flowers.",
			},
			Collision: EntityCollision{
				Fraction: 35,
				Radius:   35,
			},
		},
	},
	MobTypeCentipedeDesert: {
		Common: MobStat{
			Health:     50,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     80,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     125,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     200,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     1250,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     2500,
			BodyDamage: 25,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Centipede",
				Description: "Gotta go fast.",
			},
			Collision: EntityCollision{
				Fraction: 35,
				Radius:   35,
			},
		},
	},
	MobTypeMissileProjectile: {
		Common: MobStat{
			Health:     10,
			BodyDamage: 10,
		},
		Unusual: MobStat{
			Health:     16,
			BodyDamage: 11,
		},
		Rare: MobStat{
			Health:     25,
			BodyDamage: 13,
		},
		Epic: MobStat{
			Health:     40,
			BodyDamage: 16,
		},
		Legendary: MobStat{
			Health:     250,
			BodyDamage: 20,
		},
		Mythic: MobStat{
			Health:     500,
			BodyDamage: 25,
		},
		BaseSize: 25,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Missile",
				Description: "How did you see this?",
			},
			Collision: EntityCollision{
				Fraction: 25,
				Radius:   10,
			},
		},
	},
	MobTypeWebProjectile: {
		Common: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		Unusual: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		Rare: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		Epic: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		Legendary: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		Mythic: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		Ultra: MobStat{
			Health:     1,
			BodyDamage: 0,
		},
		BaseSize: 0,
		EntityData: EntityData[MobI18n]{
			I18n: MobI18n{
				Name:        "Web",
				Description: "How did you see this?",
			},
			Collision: EntityCollision{
				Fraction: 70,
				Radius:   50,
			},
		},
	},
}

func init() {
	data, err := json.MarshalIndent(MobProfiles, "", "  ")
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("../Shared/Florr/Native/ProfileData/mob_profiles.json", data, 0o644)
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("../Client/private/src/Florr/Native/Entity/ProfileData/mob_profiles.json", data, 0o644)
	if err != nil {
		panic(err)
	}
}
