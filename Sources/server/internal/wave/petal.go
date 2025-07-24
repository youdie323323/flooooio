package wave

import (
	"slices"
	"time"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"
)

type Petal struct {
	Entity

	Type native.PetalType

	Rarity native.Rarity

	Master       *Player
	SummonedPets []*Mob

	Detached bool

	SpinningOnMob bool

	Velocity Vector2

	// LastFasterRagingVelocityAddition is time which faster raging talent is added random velocity to this petal velocity.
	LastFasterRagingVelocityAddition time.Time
}

// Radius returns radius (display size).
func (p *Petal) Radius() float32 {
	profile := native.PetalProfiles[p.Type]
	collision := profile.Collision

	return collision.Radius * (p.Size / collision.Fraction)
}

// Diameter returns diameter (display size).
func (m *Petal) Diameter() float32 {
	return 2 * m.Radius()
}

// MaxHealth calculates max hp of petal.
func (p *Petal) MaxHealth() float32 {
	profile := native.PetalProfiles[p.Type]

	return profile.StatFromRarity(p.Rarity).Health
}

// MasterRealPosition returns real position of master by petal, since petal has movement lag because of OrbitHistoryXX.
func (p *Petal) MasterRealPosition() (x, y float32) {
	master := p.Master

	historyTargetIndex := (master.OrbitHistoryIndex + 6) % OrbitHistorySize

	return master.OrbitHistoryX[historyTargetIndex], master.OrbitHistoryY[historyTargetIndex]
}

// IsEliminated returns whether if petal was eliminated.
// This method exists because struct pointer petal reference doesnt nil'ed when removed.
func (p *Petal) IsEliminated(wp *Pool) bool {
	return wp.FindPetal(p.Id) == nil
}

var _ LightningEmitter = (*Petal)(nil) // *Petal must implement LightningEmitter

// SearchLightningBounceTargets returns targets to bounce.
func (p *Petal) SearchLightningBounceTargets(wp *Pool, bouncedIds []EntityId) []collision.Node {
	return collision.ToNodeSlice(wp.FilterMobsWithCondition(func(m *Mob) bool {
		return !(slices.Contains(bouncedIds, m.Id) ||
			slices.Contains(ProjectileMobTypes, m.Type)) &&
			m.IsEnemy()
	}))
}

func (p *Petal) OnUpdateTick(wp *Pool, now time.Time) {
	p.Mu.Lock()

	p.PetalCoordinateBoundary(wp, now)
	p.PetalCoordinateMovement(wp, now)
	p.PetalUniqueTalent(wp, now)

	p.PetalElimination(wp, now)

	{ // Base onUpdateTick
	}

	p.Mu.Unlock()
}

func (p *Petal) Dispose() {
	{
		for i := range p.SummonedPets {
			p.SummonedPets[i] = nil
		}

		p.SummonedPets = nil
	}

	p.Master = nil
}

const PetalSize = 6

// NewPetal return new petal instance.
func NewPetal(
	id EntityId,

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

		Detached: false,

		SpinningOnMob: false,

		Velocity: Vector2{0, 0},

		LastFasterRagingVelocityAddition: time.Time{},
	}
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
