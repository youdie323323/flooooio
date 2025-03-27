package wave

import (
	"flooooio/internal/native"
)

type MobId = uint32

type Mob struct {
	Entity

	// Id is identification of mob.
	Id *MobId

	Type native.MobType

	Rarity native.Rarity

	TargetEntity *Entity

	LastAttackedEntity *Entity

	PetMaster        *Entity
	PetGoingToMaster bool

	StarfishRegeningHealth bool

	ConnectingSegment *Entity
	IsFirstSegment    bool
}

// Speed return speed within mob.
func (m *Mob) Speed() float64 {
	return MobSpeed[m.Type]
}

// GetDesiredSize return desired size (display size).
func (m *Mob) GetDesiredSize() float64 {
	profile := native.MobProfiles[m.Type]
	collision := profile.Collision

	return collision.Radius * (m.Size / collision.Fraction)
}

// NewMob return new mob instance.
func NewMob(
	id *MobId,

	mType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	petMaster *Entity,

	connectingSegment *Entity,
	isFirstSegment bool,
) *Mob {
	profile := native.MobProfiles[mType]

	return &Mob{
		Entity: Entity{
			X: x,
			Y: y,

			Magnitude: 0,
			Angle:     RandomAngle(),

			Size: calculateMobSize(profile, rarity),

			// Max health
			Health: 1,
		},

		Id: id,

		Type: mType,

		Rarity: rarity,

		TargetEntity: nil,

		LastAttackedEntity: nil,

		PetMaster:        petMaster,
		PetGoingToMaster: false,

		StarfishRegeningHealth: false,

		ConnectingSegment: connectingSegment,
		IsFirstSegment:    isFirstSegment,
	}
}

func calculateMobSize(profile native.MobData, rarity native.Rarity) float64 {
	return profile.BaseSize * MobSizeFactor[rarity]
}

var MobSizeFactor = map[native.Rarity]float64{
	native.RarityCommon:    1.0,
	native.RarityUnusual:   1.2,
	native.RarityRare:      1.5,
	native.RarityEpic:      1.9,
	native.RarityLegendary: 3.0,
	native.RarityMythic:    5.0,

	native.RarityUltra: 50,
}

var MobSpeed = map[native.MobType]float64{
	native.MobTypeBee:    3.5,
	native.MobTypeSpider: 5,

	native.MobTypeCentipede:       3.5,
	native.MobTypeCentipedeEvil:   4,
	native.MobTypeCentipedeDesert: 14,

	native.MobTypeBeetle: 3.5,

	native.MobTypeSponge:    0,
	native.MobTypeBubble:    0,
	native.MobTypeJellyfish: 2,
	native.MobTypeStarfish:  3.5,
}
