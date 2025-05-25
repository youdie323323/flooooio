package native

import (
	"encoding/json"
	"os"
)

type PetalI18n struct {
	Name        string `json:"name"`
	FullName    string `json:"fullName"`
	Description string `json:"description"`
}

type PetalStat struct {
	Damage      float32  `json:"damage"`
	Health      float32  `json:"health"`
	PetalReload float32  `json:"petalReload"`
	UsageReload *float32 `json:"usageReload,omitempty"`
	Count       int      `json:"count"`

	// Maybe this should be any but ok now
	Extra map[string]float32 `json:"extra,omitempty"`
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

var PetalProfiles map[PetalType]PetalData

func init() {
	raw, err := os.ReadFile("../Shared/Native/petal_profiles.json")
	if err != nil {
		panic(err)
	}

	json.Unmarshal(raw, &PetalProfiles)
}
