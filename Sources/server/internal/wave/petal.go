package wave

import (
	"slices"
	"time"

	"flooooio/internal/collision"
	"flooooio/internal/native"
)

type Petal struct {
	Entity

	Type native.PetalType

	Rarity native.Rarity

	Master       *Player
	SummonedPets []*Mob

	DetachedFromOrbit bool

	SpinningOnMob bool

	Velocity [2]float32

	// petal_faster_raging.go struct field definitions
	LastVelocityApplied time.Time
}

// CalculateRadius return radius (display size).
func (p *Petal) CalculateRadius() float32 {
	profile := native.PetalProfiles[p.Type]
	collision := profile.Collision

	return collision.Radius * (p.Size / collision.Fraction)
}

// GetMaxHealth calculates max hp of petal.
func (p *Petal) GetMaxHealth() float32 {
	profile := native.PetalProfiles[p.Type]

	return profile.StatFromRarity(p.Rarity).Health
}

// WasEliminated determine if petal is eliminated.
// This method exists because struct pointer petal reference doesnt nil'ed when removed.
func (p *Petal) WasEliminated(wp *WavePool) bool {
	return wp.FindPetal(*p.Id) == nil
}

// Ensure petal satisfies LightningEmitter
var _ LightningEmitter = (*Petal)(nil)

// GetLightningBounceTargets returns targets to bounce.
func (p *Petal) GetLightningBounceTargets(wp *WavePool, bouncedIds []*EntityId) []collision.Node {
	mobTargets := wp.GetMobsWithCondition(func(targetMob *Mob) bool {
		return !slices.Contains(bouncedIds, targetMob.Id) && targetMob.IsTrackableEnemy()
	})

	nodeTargets := make([]collision.Node, len(mobTargets))
	for i, mob := range mobTargets {
		nodeTargets[i] = mob
	}

	return nodeTargets
}

const PetalSize = 6

// NewPetal return new petal instance.
func NewPetal(
	id *EntityId,

	pType native.PetalType,

	rarity native.Rarity,

	x float32,
	y float32,

	master *Player,
) *Petal {
	return &Petal{
		Entity: NewEntity(
			id,

			x,
			y,

			PetalSize,
		),

		Type: pType,

		Rarity: rarity,

		Master:       master,
		SummonedPets: make([]*Mob, 0),

		DetachedFromOrbit: false,

		SpinningOnMob: false,

		Velocity: [2]float32{0, 0},

		LastVelocityApplied: time.Time{},
	}
}

func (p *Petal) OnUpdateTick(wp *WavePool, now time.Time) {
	p.Mu.Lock()

	// Unneeded for petal
	// m.EntityCoordinateMovement(wp, now)

	p.PetalCoordinateBoundary(wp, now)
	p.PetalSpecialAngle(wp, now)
	p.PetalFasterRaging(wp, now)
	p.PetalElimination(wp, now)
	p.PetalCoordinateMovement(wp, now)

	{ // Base onUpdateTick
	}

	p.Mu.Unlock()
}

func (p *Petal) Dispose() {
	p.Master = nil
}

// StaticPetalData represents static data of Petal.
type StaticPetalData = StaticEntityData[native.PetalType]

const PetalMaxClusterAmount = 5

// DynamicPetal can be either single or clustered petal.
type DynamicPetal []*Petal

// IsClusterPetal checks if the petal is clustered.
func IsClusterPetal(petal DynamicPetal) bool {
	return len(petal) > 1
}

// StaticPetalSlots contains surface and bottom static slots.
type StaticPetalSlots struct {
	Surface []StaticPetalData
	Bottom  []StaticPetalData
}
