package wave

import "flooooio/internal/native"

type Petal struct {
	Entity

	Type native.PetalType

	Rarity native.Rarity

	Master      *Player
	SummonedPet *Mob

	SpinningOnMob bool

	Velocity [2]float64
}

// GetDesiredSize return desired size (display size).
func (p *Petal) GetDesiredSize() float64 {
	profile := native.PetalProfiles[p.Type]
	collision := profile.Collision

	return collision.Radius * (p.Size / collision.Fraction)
}

const PetalSize = 6

const PetalInitialCooldown = 0

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
		Entity: Entity{
			Id: id,

			X: x,
			Y: y,

			Magnitude: 0,
			Angle:     RandomAngle(),

			Size: PetalSize,

			// Max health
			Health: 1,
		},

		Type: pType,

		Rarity: rarity,

		Master:      master,
		SummonedPet: nil,

		SpinningOnMob: false,

		Velocity: [2]float64{0, 0},
	}
}

// CalculateMaxHealth calculates max hp of petal.
func (p *Petal) CalculateMaxHealth() float64 {
	profile := native.PetalProfiles[p.Type]

	return profile.StatFromRarity(p.Rarity).Health
}

// WasEliminated determine if petal is eliminated.
// This method exists because struct pointer petal reference doesnt nil'ed when removed.
func (m *Petal) WasEliminated(wp *WavePool) bool {
	return wp.FindPetal(*m.Id) == nil
}

const petalVelocityFriction = 0.8125

func (m *Petal) OnUpdateTick(wp *WavePool) {
	// Unneeded for petal
	// m.EntityCoordinateMovement(wp)

	m.PetalElimination(wp)

	{ // Base onUpdateTick
		m.Velocity[0] *= petalVelocityFriction
		m.Velocity[1] *= petalVelocityFriction

		m.X += m.Velocity[0]
		m.Y += m.Velocity[1]
	}
}

func (p *Petal) Dispose() {
	p.Master = nil
	p.SummonedPet = nil
}

// StaticPetal represents static data of Mob.
type StaticPetal struct {
	Type   native.PetalType
	Rarity native.Rarity
}

const MaxClusterAmount = 5

// DynamicPetal can be either single or clustered petal.
type DynamicPetal []*Mob

// IsClusterPetal checks if the petal is clustered.
func IsClusterPetal(petal DynamicPetal) bool {
	return len(petal) > 1
}

// Slot can be StaticPetal, DynamicPetal, or nil.
type Slot any

// IsDynamicPetal determines if slot is dynamic (living).
func IsDynamicPetal(slot Slot) bool {
	_, ok := slot.(DynamicPetal)

	return ok
}

// StaticPlayerPetalSlots contains surface and bottom slots.
type StaticPlayerPetalSlots struct {
	Surface []Slot
	Bottom  []Slot
}
