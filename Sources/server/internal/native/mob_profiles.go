package native

import (
	"encoding/json"
	"os"
)

type MobI18n struct {
	Name        string `json:"name"`
	FullName    string `json:"fullName"`
	Description string `json:"description"`
}

type MobStat struct {
	BodyDamage float64        `json:"bodyDamage"`
	Health     float64        `json:"health"`
	Extra      map[string]any `json:"extra,omitempty"`
}

// GetDamage returns damage within MobStat.
func (s MobStat) GetDamage() float64 {
	return s.BodyDamage
}

type MobData struct {
	EntityData[MobI18n]

	BaseSize float64 `json:"baseSize"`

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

	case RarityUltra:
		return d.Ultra

	default:
		return d.Common
	}
}

var MobProfiles map[MobType]MobData

func init() {
	raw, err := os.ReadFile("../Shared/Native/mob_profiles.json")
	if err != nil {
		panic(err)
	}

	json.Unmarshal(raw, &MobProfiles)
}
