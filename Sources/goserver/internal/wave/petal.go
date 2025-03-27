package wave

import "flooooio/internal/native"

type PetalId = uint32

type Petal struct {
	Entity

	// Id is identification of petal.
	Id *PetalId

	Type native.PetalType

	Rarity native.Rarity

	Master     *Player
	PetBinding *Mob

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
	id *PetalId,

	pType native.PetalType,

	rarity native.Rarity,

	x float64,
	y float64,

	master *Player,
) *Petal {
	return &Petal{
		Entity: Entity{
			X: x,
			Y: y,

			Magnitude: 0,
			Angle:     RandomAngle(),

			Size: PetalSize,

			// Max health
			Health: 1,
		},

		Id: id,

		Type: pType,

		Rarity: rarity,

		Master:     master,
		PetBinding: nil,

		SpinningOnMob: false,

		Velocity: [2]float64{0, 0},
	}
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
