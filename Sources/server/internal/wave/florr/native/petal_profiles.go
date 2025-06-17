package native

import (
	"encoding/json"
	"os"
)

type PetalI18n struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type PetalStat struct {
	Damage      float32  `json:"damage"`
	Health      float32  `json:"health"`
	PetalReload float32  `json:"petalReload"`
	UsageReload *float32 `json:"usageReload,omitempty"`
	Count       int      `json:"count"`

	// Maybe this should be any but ok now
	Extra EntityExtra `json:"extra,omitempty"`
}

// GetDamage returns damage within PetalStat.
func (s PetalStat) GetDamage() float32 {
	return s.Damage
}

type PetalData struct {
	EntityData[PetalI18n]

	// Bit fancy... :(
	Common    PetalStat `json:"0"`
	Unusual   PetalStat `json:"1"`
	Rare      PetalStat `json:"2"`
	Epic      PetalStat `json:"3"`
	Legendary PetalStat `json:"4"`
	Mythic    PetalStat `json:"5"`
	Ultra     PetalStat `json:"6"`
}

func inlineFloat32Pointer(f float32) *float32 {
	return &f
}

func (d PetalData) StatFromRarity(r Rarity) PetalStat {
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

	case RarityUltra:
		return d.Ultra

	default:
		return d.Common
	}
}

var PetalProfiles = map[PetalType]PetalData{
	PetalTypeBasic: {
		Common: PetalStat{
			Damage:      10,
			Health:      10,
			PetalReload: 2.5,
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      13,
			Health:      12,
			PetalReload: 2.5,
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      18,
			Health:      14,
			PetalReload: 2.5,
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      24,
			Health:      17,
			PetalReload: 2.5,
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      32,
			Health:      21,
			PetalReload: 2.5,
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      40,
			Health:      25,
			PetalReload: 2.5,
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      100,
			Health:      50,
			PetalReload: 2.5,
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Basic",
				Description: "A nice petal, not too strong but not too weak.",
			},
			Collision: EntityCollision{
				Fraction: 15,
				Radius:   15,
			},
		},
	},
	PetalTypeFaster: {
		Common: PetalStat{
			Damage:      8,
			Health:      5,
			PetalReload: 0.8,
			Count:       1,

			Extra: EntityExtra{
				"rad": 0.15,
			},
		},
		Unusual: PetalStat{
			Damage:      10.4,
			Health:      6,
			PetalReload: 0.8,
			Count:       1,
			Extra: EntityExtra{
				"rad": 0.195,
			},
		},
		Rare: PetalStat{
			Damage:      14.4,
			Health:      7,
			PetalReload: 0.8,
			Count:       1,

			Extra: EntityExtra{
				"rad": 0.27,
			},
		},
		Epic: PetalStat{
			Damage:      19.2,
			Health:      8.5,
			PetalReload: 0.8,
			Count:       1,

			Extra: EntityExtra{
				"rad": 0.36,
			},
		},
		Legendary: PetalStat{
			Damage:      25.6,
			Health:      10.5,
			PetalReload: 0.8,
			Count:       1,

			Extra: EntityExtra{
				"rad": 0.48,
			},
		},
		Mythic: PetalStat{
			Damage:      40,
			Health:      25,
			PetalReload: 0.8,
			Count:       1,

			Extra: EntityExtra{
				"rad": 1.2,
			},
		},
		Ultra: PetalStat{
			Damage:      100,
			Health:      50,
			PetalReload: 0.8,
			Count:       1,

			Extra: EntityExtra{
				"rad": 3,
			},
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Faster",
				Description: "It's so light it makes your other petals spin faster.",
			},
			Collision: EntityCollision{
				Fraction: 15,
				Radius:   15,
			},
		},
	},
	PetalTypeEggBeetle: {
		Common: PetalStat{
			Damage:      1,
			Health:      10,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(2),
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      1.2,
			Health:      13,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(2),
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      1.4,
			Health:      18,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(2),
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      1.7,
			Health:      24,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(2),
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      2.1,
			Health:      32,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(2),
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      2.5,
			Health:      100,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      5,
			Health:      250,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Beetle Egg",
				Description: "Something interesting might pop out of this.",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   40,
			},
		},
	},
	PetalTypeBubble: {
		Common: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 5.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 4.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 3.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 1.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 0.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      0,
			Health:      1,
			PetalReload: 0.1,
			UsageReload: inlineFloat32Pointer(0.1),
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Bubble",
				Description: "Physics are for the weak.",
			},
			Collision: EntityCollision{
				Fraction: 15,
				Radius:   20,
			},
		},
	},
	PetalTypeYinYang: {
		Common: PetalStat{
			Damage:      7,
			Health:      7,
			PetalReload: 1,
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      9.1,
			Health:      8.4,
			PetalReload: 1,
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      12.6,
			Health:      9.8,
			PetalReload: 1,
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      16.8,
			Health:      11.9,
			PetalReload: 1,
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      22.4,
			Health:      14.7,
			PetalReload: 1,
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      28,
			Health:      17.5,
			PetalReload: 1,
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      70,
			Health:      35,
			PetalReload: 1,
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Yin Yang",
				Description: "This mysterious petal affects the rotation of your petals in unpredictable ways.",
			},
			Collision: EntityCollision{
				Fraction: 20,
				Radius:   20,
			},
		},
	},
	PetalTypeMysteriousStick: {
		Common: PetalStat{
			Damage:      1,
			Health:      10,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(10),
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      1.2,
			Health:      13,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(8),
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      1.4,
			Health:      18,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(6),
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      1.7,
			Health:      24,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(4),
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      2.1,
			Health:      32,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(2),
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      2.5,
			Health:      40,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(1),
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      5,
			Health:      100,
			PetalReload: 4,
			UsageReload: inlineFloat32Pointer(0.1),
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Stick",
				Description: "I DONT KNOW SHITTTT",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   10,
			},
		},
	},
	PetalTypeSand: {
		Common: PetalStat{
			Damage:      5,
			Health:      5,
			PetalReload: 0.8,
			Count:       4,
		},
		Unusual: PetalStat{
			Damage:      6.5,
			Health:      6,
			PetalReload: 0.8,
			Count:       4,
		},
		Rare: PetalStat{
			Damage:      9,
			Health:      7,
			PetalReload: 0.8,
			Count:       4,
		},
		Epic: PetalStat{
			Damage:      12,
			Health:      8.5,
			PetalReload: 0.8,
			Count:       4,
		},
		Legendary: PetalStat{
			Damage:      16,
			Health:      10.5,
			PetalReload: 0.8,
			Count:       4,
		},
		Mythic: PetalStat{
			Damage:      20,
			Health:      12.5,
			PetalReload: 0.4,
			Count:       4,
		},
		Ultra: PetalStat{
			Damage:      50,
			Health:      25,
			PetalReload: 0.4,
			Count:       4,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Sand",
				Description: "A bunch of sand particles.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   7,
			},
		},
	},
	PetalTypeLightning: {
		Common: PetalStat{
			Damage:      0,
			Health:      10,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 12,
				"bounces":   2,
			},
		},
		Unusual: PetalStat{
			Damage:      0,
			Health:      12,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 15.6,
				"bounces":   3,
			},
		},
		Rare: PetalStat{
			Damage:      0,
			Health:      14,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 21.6,
				"bounces":   4,
			},
		},
		Epic: PetalStat{
			Damage:      0,
			Health:      17,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 28.8,
				"bounces":   5,
			},
		},
		Legendary: PetalStat{
			Damage:      0,
			Health:      21,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 38.4,
				"bounces":   6,
			},
		},
		Mythic: PetalStat{
			Damage:      0,
			Health:      25,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 48,
				"bounces":   15,
			},
		},
		Ultra: PetalStat{
			Damage:      0,
			Health:      50,
			PetalReload: 2.5,
			Count:       1,

			Extra: EntityExtra{
				"lightning": 120,
				"bounces":   15,
			},
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Lightning",
				Description: "Strikes several nearby enemies.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   12,
			},
		},
	},
	PetalTypeClaw: {
		Common: PetalStat{
			Damage:      10,
			Health:      10,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 9,
				"limit":         100,
			},
		},
		Unusual: PetalStat{
			Damage:      13,
			Health:      12,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 11.7,
				"limit":         130,
			},
		},
		Rare: PetalStat{
			Damage:      18,
			Health:      14,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 16.2,
				"limit":         180,
			},
		},
		Epic: PetalStat{
			Damage:      24,
			Health:      17,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 21.6,
				"limit":         240,
			},
		},
		Legendary: PetalStat{
			Damage:      32,
			Health:      21,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 28.8,
				"limit":         320,
			},
		},
		Mythic: PetalStat{
			Damage:      40,
			Health:      25,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 36,
				"limit":         1200,
			},
		},
		Ultra: PetalStat{
			Damage:      100,
			Health:      50,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"percentDamage": 90,
				"limit":         3000,
			},
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Claw",
				Description: "Deals extra damage if victim is above 80% health. -50percentDamage versus other flowers.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   15,
			},
		},
	},
	PetalTypeFang: {
		Common: PetalStat{
			Damage:      10,
			Health:      10,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"damageHealed": 100,
			},
		},
		Unusual: PetalStat{
			Damage:      13,
			Health:      12,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"damageHealed": 100,
			},
		},
		Rare: PetalStat{
			Damage:      18,
			Health:      14,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"damageHealed": 100,
			},
		},
		Epic: PetalStat{
			Damage:      24,
			Health:      17,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"damageHealed": 100,
			},
		},
		Legendary: PetalStat{
			Damage:      32,
			Health:      21,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"damageHealed": 100,
			},
		},
		Mythic: PetalStat{
			Damage:      40,
			Health:      25,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				"damageHealed": 300,
			},
		},
		Ultra: PetalStat{
			Damage:      100,
			Health:      50,
			PetalReload: 3.5,
			Count:       1,

			Extra: EntityExtra{
				// TODO: this is zero on xlsx data
				"damageHealed": 500,
			},
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Fangs",
				Description: "Heals based on damage dealt by this petal.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   13,
			},
		},
	},
	PetalTypeYggdrasil: {
		Common: PetalStat{
			Damage:      10,
			Health:      10,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      12,
			Health:      13,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      14,
			Health:      18,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      17,
			Health:      24,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      21,
			Health:      32,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(15),
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      25,
			Health:      40,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(5),
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      50,
			Health:      100,
			PetalReload: 2.5,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Yggdrasil",
				Description: "A dried leaf from the Yggdrasil tree. Rumored to be able to bring the fallen back to life.",
			},
			Collision: EntityCollision{
				Fraction: 16,
				Radius:   28,
			},
		},
	},
	PetalTypeWeb: {
		Common: PetalStat{
			Damage:      8,
			Health:      5,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 10,
				"radius":   50,
			},
		},
		Unusual: PetalStat{
			Damage:      9.6,
			Health:      6.5,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 10,
				"radius":   60,
			},
		},
		Rare: PetalStat{
			Damage:      11.2,
			Health:      9,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 10,
				"radius":   70,
			},
		},
		Epic: PetalStat{
			Damage:      13.6,
			Health:      12,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 10,
				"radius":   80,
			},
		},
		Legendary: PetalStat{
			Damage:      16.8,
			Health:      16,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 10,
				"radius":   90,
			},
		},
		Mythic: PetalStat{
			Damage:      20,
			Health:      20,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 10,
				"radius":   200,
			},
		},
		Ultra: PetalStat{
			Damage:      40,
			Health:      50,
			PetalReload: 3,
			UsageReload: inlineFloat32Pointer(0.5),
			Count:       1,

			Extra: EntityExtra{
				"duration": 30,
				"radius":   200,
			},
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Web",
				Description: "It's really sticky.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   13,
			},
		},
	},
	PetalTypeStinger: {
		Common: PetalStat{
			Damage:      35,
			Health:      2,
			PetalReload: 2.5,
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      45.5,
			Health:      2.4,
			PetalReload: 2.5,
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      63,
			Health:      2.8,
			PetalReload: 2.5,
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      84,
			Health:      3.4,
			PetalReload: 2.5,
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      112,
			Health:      4.2,
			PetalReload: 2.5,
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      140,
			Health:      5,
			PetalReload: 2.5,
			Count:       3,
		},
		Ultra: PetalStat{
			Damage:      350,
			Health:      10,
			PetalReload: 2.5,
			Count:       5,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Stinger",
				Description: "Fuck you.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   10,
			},
		},
	},
	PetalTypeWing: {
		Common: PetalStat{
			Damage:      10,
			Health:      15,
			PetalReload: 1.25,
			Count:       1,
		},
		Unusual: PetalStat{
			Damage:      13,
			Health:      18,
			PetalReload: 1.25,
			Count:       1,
		},
		Rare: PetalStat{
			Damage:      18,
			Health:      21,
			PetalReload: 1.25,
			Count:       1,
		},
		Epic: PetalStat{
			Damage:      24,
			Health:      25.5,
			PetalReload: 1.25,
			Count:       1,
		},
		Legendary: PetalStat{
			Damage:      32,
			Health:      31.5,
			PetalReload: 1.25,
			Count:       1,
		},
		Mythic: PetalStat{
			Damage:      40,
			Health:      37.5,
			PetalReload: 0.13,
			Count:       1,
		},
		Ultra: PetalStat{
			Damage:      100,
			Health:      75,
			PetalReload: 0.13,
			Count:       1,
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Wing",
				Description: "Fuck you.",
			},
			Collision: EntityCollision{
				Fraction: 10,
				Radius:   15,
			},
		},
	},
	PetalTypeMagnet: {
		Common: PetalStat{
			Damage:      5,
			Health:      15,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 150,
			},
		},
		Unusual: PetalStat{
			Damage:      6,
			Health:      19.5,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 195,
			},
		},
		Rare: PetalStat{
			Damage:      7,
			Health:      27,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 270,
			},
		},
		Epic: PetalStat{
			Damage:      8.5,
			Health:      36,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 360,
			},
		},
		Legendary: PetalStat{
			Damage:      10.5,
			Health:      48,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 480,
			},
		},
		Mythic: PetalStat{
			Damage:      12.5,
			Health:      60,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 800,
			},
		},
		Ultra: PetalStat{
			Damage:      25,
			Health:      150,
			PetalReload: 1.5,
			Count:       1,

			Extra: EntityExtra{
				"pickupRange": 2500,
			},
		},
		EntityData: EntityData[PetalI18n]{
			I18n: PetalI18n{
				Name:        "Magnet",
				Description: "Fuck you.",
			},
			Collision: EntityCollision{
				Fraction: 18,
				Radius:   40,
			},
		},
	},
}

func init() {
	data, err := json.MarshalIndent(PetalProfiles, "", "  ")
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("../Shared/Florr/Native/ProfileData/petal_profiles.json", data, 0o644)
	if err != nil {
		panic(err)
	}

	err = os.WriteFile("../Client/private/src/Florr/Native/Entity/ProfileData/petal_profiles.json", data, 0o644)
	if err != nil {
		panic(err)
	}
}
