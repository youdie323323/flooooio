package wave

import (
	"time"

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

	Velocity [2]float64

	// petal_faster_raging.go struct field definitions
	LastVelocityApplied time.Time
}

// CalculateRadius return radius (display size).
func (p *Petal) CalculateRadius() float64 {
	profile := native.PetalProfiles[p.Type]
	collision := profile.Collision

	return collision.Radius * (p.Size / collision.Fraction)
}

// GetMaxHealth calculates max hp of petal.
func (p *Petal) GetMaxHealth() float64 {
	profile := native.PetalProfiles[p.Type]

	return profile.StatFromRarity(p.Rarity).Health
}

// WasEliminated determine if petal is eliminated.
// This method exists because struct pointer petal reference doesnt nil'ed when removed.
func (p *Petal) WasEliminated(wp *WavePool) bool {
	return wp.FindPetal(*p.Id) == nil
}

const PetalSize = 6

// NewPetal return new petal instance.
func NewPetal(
	id *EntityId,

	pType native.PetalType,

	rarity native.Rarity,

	x float64,
	y float64,

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

		Velocity: [2]float64{0, 0},

		LastVelocityApplied: time.Time{},
	}
}

func (p *Petal) OnUpdateTick(wp *WavePool) {
	p.Mu.Lock()

	// Unneeded for petal
	// m.EntityCoordinateMovement(wp)

	p.PetalCoordinateBoundary(wp)
	p.PetalSpecialAngle(wp)
	p.PetalFasterRaging(wp)
	p.PetalElimination(wp)

	{ // Base onUpdateTick
		p.Velocity[0] *= petalVelocityFriction
		p.Velocity[1] *= petalVelocityFriction

		p.X += p.Velocity[0]
		p.Y += p.Velocity[1]
	}

	p.Mu.Unlock()
}

func (p *Petal) Dispose() {
	p.Master = nil
}

// StaticPetal represents static data of Petal.
type StaticPetal struct {
	Type   native.PetalType
	Rarity native.Rarity
}

const PetalMaxClusterAmount = 5

// DynamicPetal can be either single or clustered petal.
type DynamicPetal []*Petal

// IsClusterPetal checks if the petal is clustered.
func IsClusterPetal(petal DynamicPetal) bool {
	return len(petal) > 1
}

// StaticPetalSlots contains surface and bottom slots.
type StaticPetalSlots struct {
	Surface []StaticPetal
	Bottom  []StaticPetal
}
