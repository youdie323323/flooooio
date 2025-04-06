package wave

import (
	"flooooio/internal/native"
)

type Mob struct {
	Entity

	Type native.MobType

	Rarity native.Rarity

	TargetEntity Node

	LastAttackedEntity Node

	PetMaster        *Player
	PetGoingToMaster bool

	StarfishRegeningHealth bool

	// ConnectingSegment represents connected segment.
	// Using collision.Node here because its not possible to Mob refer itself.
	// Use type assertion.
	ConnectingSegment Node
	IsFirstSegment    bool

	// mob_special_movement.go struct field definitions
	SineWaveIndex        int
	RotationCounter      int
	SpecialMovementTimer float64
	IsSpecialMoving      bool
}

// Speed return speed within mob.
func (m *Mob) Speed() float64 {
	return MobSpeed[m.Type]
}

// DesiredSize return desired size (display size).
func (m *Mob) DesiredSize() float64 {
	profile := native.MobProfiles[m.Type]
	collision := profile.Collision

	return collision.Radius * (m.Size / collision.Fraction)
}

// CalculateMaxHealth calculates max hp of mob.
func (m *Mob) CalculateMaxHealth() float64 {
	profile := native.MobProfiles[m.Type]

	return profile.StatFromRarity(m.Rarity).Health
}

// WasEliminated determine if mob is eliminated.
// This method exists because struct pointer mob reference doesnt nil'ed when removed.
func (m *Mob) WasEliminated(wp *WavePool) bool {
	return wp.FindMob(*m.Id) == nil
}

func (m *Mob) OnUpdateTick(wp *WavePool) {
	m.Mu.Lock()

	m.EntityCoordinateMovement(wp)
	m.MobCoordinateBoundary(wp)
	m.MobElimination(wp)
	m.MobCollision(wp)

	m.MobBodyConnection(wp)
	m.MobHealthRegen(wp)
	m.MobAggressivePursuit(wp)
	m.MobSpecialMovement(wp)

	{ // Base onUpdateTick
	}

	m.Mu.Unlock()
}

func (m *Mob) Dispose() {

	m.TargetEntity = nil

	m.LastAttackedEntity = nil

	m.PetMaster = nil

	m.ConnectingSegment = nil
}

// NewMob return new mob instance.
func NewMob(
	id *EntityId,

	mType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	petMaster *Player,

	connectingSegment Node,
	isFirstSegment bool,
) *Mob {
	profile := native.MobProfiles[mType]

	return &Mob{
		Entity: Entity{
			Id: id,

			X: x,
			Y: y,

			Magnitude: 0,
			Angle:     RandomAngle(),

			Size: CalculateMobSize(profile, rarity),

			// Max health
			Health: 1,
		},

		Type: mType,

		Rarity: rarity,

		TargetEntity: nil,

		LastAttackedEntity: nil,

		PetMaster:        petMaster,
		PetGoingToMaster: false,

		StarfishRegeningHealth: false,

		ConnectingSegment: connectingSegment,
		IsFirstSegment:    isFirstSegment,

		// mob_special_movement default values
		SineWaveIndex:        0,
		RotationCounter:      0,
		SpecialMovementTimer: 0,
		IsSpecialMoving:      false,
	}
}

func CalculateMobSize(profile native.MobData, rarity native.Rarity) float64 {
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
	native.MobTypeBee:    2.8,
	native.MobTypeSpider: 4,

	native.MobTypeBeetle:       2.8,
	native.MobTypeSandstorm:    2,
	native.MobTypeCactus:       0,
	native.MobTypeScorpion:     3,
	native.MobTypeLadybugShiny: 2,

	native.MobTypeStarfish:  2.8,
	native.MobTypeJellyfish: 1,
	native.MobTypeBubble:    0,
	native.MobTypeSponge:    0,
	native.MobTypeShell:    0,

	native.MobTypeCentipede:       2.8,
	native.MobTypeCentipedeEvil:   3.2,
	native.MobTypeCentipedeDesert: 11.2,
}
