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
	Damage      float64 `json:"damage"`
	Health      float64 `json:"health"`
	PetalReload float64 `json:"petalReload"`
	Count       float64 `json:"count"`

	UsageReload *float64 `json:"usageReload,omitempty"`

	Extra map[string]any `json:"extra,omitempty"`
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
	case RarityCommon: {
		return d.Common
	}

	case RarityUnusual: {
		return d.Unusual
	}

	case RarityRare: {
		return d.Rare
	}

	case RarityEpic: {
		return d.Epic
	}

	case RarityLegendary: {
		return d.Legendary
	}

	case RarityMythic: {
		return d.Mythic
	}

	case RarityUltra: {
		return d.Ultra
	}
	}

	panic("PetalData.StatFromRarity: invalid rarity")
}

var PetalProfiles map[PetalType]PetalData

func init() {
	raw, err := os.ReadFile("../Shared/Native/petal_profiles.json")
	if err != nil {
		panic(err)
	}

	json.Unmarshal(raw, &PetalProfiles)
}
