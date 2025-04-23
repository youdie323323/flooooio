package wave

import (
	"slices"
	"time"

	"flooooio/internal/collision"
	"flooooio/internal/native"
)

type Mob struct {
	Entity

	Type native.MobType

	Rarity native.Rarity

	TargetEntity collision.Node

	LastAttackedEntity collision.Node

	PetMaster        *Player
	PetGoingToMaster bool

	// MissileMaster is master which owns this missile.
	MissileMaster *Mob

	StarfishRegeningHealth bool

	// ConnectingSegment represents connected segment.
	// Use collision.Node here because its not possible to Mob refer itself.
	// Use type assertion.
	ConnectingSegment collision.Node
	IsFirstSegment    bool

	// JellyfishLastBounce is last time lightning bounced from jellyfish.
	JellyfishLastBounce time.Time

	// HornetLastMissileShoot is last time hornet shooted missile.
	HornetLastMissileShoot time.Time

	// mob_special_movement.go struct field definitions
	SineWaveIndex        int
	RotationCounter      int
	SpecialMovementTimer float64
	IsSpecialMoving      bool
}

// SpeedOf statically return speed within mob.
func SpeedOf(mType native.MobType) float64 {
	return MobSpeed[mType]
}

// CalculateRadius return radius (display size).
func (m *Mob) CalculateRadius() float64 {
	profile := native.MobProfiles[m.Type]
	collision := profile.Collision

	return collision.Radius * (m.Size / collision.Fraction)
}

// GetMaxHealth calculates max hp of mob.
func (m *Mob) GetMaxHealth() float64 {
	profile := native.MobProfiles[m.Type]

	return profile.StatFromRarity(m.Rarity).Health
}

// IsEnemyMissile determinate if mob is enemy missile from player side.
func (m *Mob) IsEnemyMissile() bool {
	return m.MissileMaster != nil && m.MissileMaster.PetMaster == nil
}

// IsEnemy determinate if mob is enemy from player side.
func (m *Mob) IsEnemy() bool {
	mIsProjectile := slices.Contains(ProjectileMobTypes, m.Type)

	return m.PetMaster == nil && (!mIsProjectile || (mIsProjectile && m.IsEnemyMissile()))
}

// WasEliminated determine if mob is eliminated.
// This method exists because struct pointer mob reference doesnt nil'ed when removed.
func (m *Mob) WasEliminated(wp *WavePool) bool {
	return wp.FindMob(*m.Id) == nil
}

func (m *Mob) OnUpdateTick(wp *WavePool) {
	m.Mu.Lock()

	m.MobCoordinateMovement(wp)
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

	m.MissileMaster = nil

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

	connectingSegment collision.Node,
	isFirstSegment bool,

	missileMaster *Mob,
) *Mob {
	profile := native.MobProfiles[mType]

	return &Mob{
		Entity: NewEntity(
			id,

			x,
			y,

			CalculateMobSize(profile, rarity),
		),

		Type: mType,

		Rarity: rarity,

		TargetEntity: nil,

		LastAttackedEntity: nil,

		PetMaster:        petMaster,
		PetGoingToMaster: false,

		MissileMaster: missileMaster,

		StarfishRegeningHealth: false,

		ConnectingSegment: connectingSegment,
		IsFirstSegment:    isFirstSegment,

		JellyfishLastBounce: time.Time{},

		HornetLastMissileShoot: time.Time{},

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
	native.RarityUltra:     8.1,
}

var MobSpeed = map[native.MobType]float64{
	native.MobTypeBee:    2.8,
	native.MobTypeSpider: 5,
	native.MobTypeHornet: 3,

	native.MobTypeBeetle:       2.8,
	native.MobTypeSandstorm:    2,
	native.MobTypeCactus:       0,
	native.MobTypeScorpion:     3,
	native.MobTypeLadybugShiny: 2,

	native.MobTypeStarfish:  2.8,
	native.MobTypeJellyfish: 0.5,
	native.MobTypeBubble:    0,
	native.MobTypeSponge:    0,
	native.MobTypeShell:     0,
	native.MobTypeCrab:      4,

	native.MobTypeCentipede:       2.8,
	native.MobTypeCentipedeEvil:   3.2,
	native.MobTypeCentipedeDesert: 11.2,

	native.MobTypeMissile: 10,
}
