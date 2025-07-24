package wave

import (
	"slices"
	"time"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"
)

type Mob struct {
	Entity

	Poisonable

	Type native.MobType

	Rarity native.Rarity

	TargetEntity collision.Node

	MagnitudeMultiplier float32

	// SigmaT is the time this mob has experienced so far.
	// Represented in second.
	SigmaT float32

	LastAttackedEntity collision.Node

	PetMaster        *Player
	PetGoingToMaster bool

	StarfishRegeningHealth bool

	// ConnectingSegment represents connected segment.
	// Use collision.Node here because its not possible to Mob refer itself.
	// Use type assertion.
	ConnectingSegment   collision.Node
	ConnectedSegmentIds []EntityId
	IsFirstSegment      bool

	// JellyfishLastBounce is last time lightning bounced from jellyfish.
	JellyfishLastBounce time.Time

	// HornetLastMissileShoot is last time hornet shooted missile.
	HornetLastMissileShoot time.Time

	// mob_special_movement.go struct field definitions
	SineWaveIndex   int
	RotationCounter int
	MovementTimer   float32
	IsSpecialMoving bool
}

// MobSpeedOf returns speed of mob type.
func MobSpeedOf(mType native.MobType) float32 {
	return MobSpeed[mType]
}

// Radius returns radius (display size).
func (m *Mob) Radius() float32 {
	profile := native.MobProfiles[m.Type]
	collision := profile.Collision

	return collision.Radius * (m.Size / collision.Fraction)
}

// Diameter returns diameter (display size).
func (m *Mob) Diameter() float32 {
	return 2 * m.Radius()
}

// MaxHealth calculates max hp of mob.
func (m *Mob) MaxHealth() float32 {
	profile := native.MobProfiles[m.Type]

	return profile.StatFromRarity(m.Rarity).Health
}

// IsEnemy determinate if mob is enemy from player side.
func (m *Mob) IsEnemy() bool {
	return m.PetMaster == nil
}

// IsAlly determinate if mob is ally from player side.
func (m *Mob) IsAlly() bool {
	return m.PetMaster != nil
}

// IsProjectile determinate if mob is projectile.
func (m *Mob) IsProjectile() bool {
	return slices.Contains(ProjectileMobTypes, m.Type)
}

// IsOrganismEnemy determinate if mob is enemy from player side and its living organism.
func (m *Mob) IsOrganismEnemy() bool {
	return m.IsEnemy() && !m.IsProjectile()
}

// IsOrganismAlly determinate if mob is living organism and not enemy.
func (m *Mob) IsOrganismAlly() bool {
	return m.IsAlly() && !m.IsProjectile()
}

// HasConnectingSegment determinate if mob has connecting segment.
func (m *Mob) HasConnectingSegment(wp *Pool) bool {
	return m.ConnectingSegment != nil && !IsDeadNode(wp, m.ConnectingSegment)
}

// MobToDamage returns mob to damage.
func (m *Mob) MobToDamage(wp *Pool) *Mob {
	var toDamaged *Mob

	switch m.Type {
	case native.MobTypeLeech:
		// Leech emit all damages into head leech entity
		toDamaged = TraverseMobSegments(wp, m)

	default:
		toDamaged = m
	}

	return toDamaged
}

// IsEliminated returns whether if mob was eliminated.
// This method exists because struct pointer mob reference doesnt nil'ed when removed.
func (m *Mob) IsEliminated(wp *Pool) bool {
	return wp.FindMob(m.Id) == nil
}

var _ LightningEmitter = (*Mob)(nil) // *Mob must implement LightningEmitter

// SearchLightningBounceTargets returns targets to bounce.
func (m *Mob) SearchLightningBounceTargets(wp *Pool, bouncedIds []EntityId) []collision.Node {
	if m.IsEnemy() {
		return slices.Concat(
			collision.ToNodeSlice(wp.FilterPlayersWithCondition(func(p *Player) bool {
				return !slices.Contains(bouncedIds, p.Id)
			})),
			collision.ToNodeSlice(wp.FilterMobsWithCondition(func(m *Mob) bool {
				return !(slices.Contains(bouncedIds, m.Id) ||
					slices.Contains(ProjectileMobTypes, m.Type)) &&
					m.IsAlly()
			})),
		)
	} else {
		return collision.ToNodeSlice(wp.FilterMobsWithCondition(func(m *Mob) bool {
			return !(slices.Contains(bouncedIds, m.Id) ||
				slices.Contains(ProjectileMobTypes, m.Type)) &&
				m.IsEnemy()
		}))
	}
}

func (m *Mob) OnUpdateTick(wp *Pool, now time.Time) {
	m.Mu.Lock()

	m.MobCoordinateMovement(wp, now)
	m.MobCoordinateBoundary(wp, now)
	m.MobCollision(wp, now)

	m.MobBodyConnection(wp, now)
	m.MobBehavior(wp, now)
	m.MobUniqueTalent(wp, now)

	m.MobElimination(wp, now)

	{ // Base onUpdateTick
		m.SigmaT += DeltaT

		{ // Take poison damage
			if m.IsPoisoned.Load() {
				dp := m.PoisonDPS * DeltaT

				mMaxHealth := m.MaxHealth()

				m.Health -= dp / mMaxHealth
				m.Health = max(0, m.Health)

				m.TotalPoison += dp

				if m.TotalPoison >= m.StopAtPoison {
					m.IsPoisoned.Store(false)

					m.TotalPoison = m.StopAtPoison
				}
			}
		}
	}

	m.Mu.Unlock()
}

func (m *Mob) Dispose() {
	m.TargetEntity = nil

	m.LastAttackedEntity = nil

	m.PetMaster = nil

	m.ConnectingSegment = nil

	m.ConnectedSegmentIds = nil
}

// NewMob return new mob instance.
func NewMob(
	id EntityId,

	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,
) *Mob {
	// Ultra+ stats is not defined for mob
	// This will broke web projectile since they are using their rarity for petal profile
	// if rarity >= native.RarityUltra {
	// 	return nil
	// }

	// TODO: add field that notify health should be randomized in ±5

	profile := native.MobProfiles[mType]

	var size float32

	switch mType {
	case native.MobTypeWebProjectile:
		size = native.PetalProfiles[native.PetalTypeWeb].StatFromRarity(rarity).Extra["radius"]

	default:
		size = CalculateMobSize(profile, rarity)
	}

	m := &Mob{
		Entity: NewEntity(
			id,

			x,
			y,

			size,
		),

		Poisonable: NewPoisonable(),

		Type: mType,

		Rarity: rarity,

		TargetEntity: nil,

		MagnitudeMultiplier: 1,

		SigmaT: 0,

		LastAttackedEntity: nil,

		PetMaster:        petMaster,
		PetGoingToMaster: false,

		StarfishRegeningHealth: false,

		ConnectingSegment:   connectingSegment,
		ConnectedSegmentIds: make([]EntityId, 0),
		IsFirstSegment:      isFirstSegment,

		JellyfishLastBounce: time.Time{},

		HornetLastMissileShoot: time.Time{},

		// mob_special_movement default values
		SineWaveIndex:   0,
		RotationCounter: 0,
		MovementTimer:   0,
		IsSpecialMoving: false,
	}

	// We only want connected segment ids for mob (leech)
	if v, ok := connectingSegment.(*Mob); ok {
		v.ConnectedSegmentIds = append(v.ConnectedSegmentIds, m.Id)
	}

	return m
}

func CalculateMobSize(profile native.MobData, rarity native.Rarity) float32 {
	return profile.BaseSize * MobSizeFactor[rarity]
}

var MobSizeFactor = map[native.Rarity]float32{
	native.RarityCommon:    1.0,
	native.RarityUnusual:   1.2,
	native.RarityRare:      1.5,
	native.RarityEpic:      1.9,
	native.RarityLegendary: 3.0,
	native.RarityMythic:    5.0,
}

var MobSpeed = map[native.MobType]float32{
	native.MobTypeBee:        2.8,
	native.MobTypeSpider:     5,
	native.MobTypeHornet:     3,
	native.MobTypeBabyAnt:    4,
	native.MobTypeWorkerAnt:  4,
	native.MobTypeSoldierAnt: 4,

	native.MobTypeBeetle:       2.8,
	native.MobTypeSandstorm:    2,
	native.MobTypeCactus:       0,
	native.MobTypeScorpion:     4,
	native.MobTypeLadybugShiny: 2,

	native.MobTypeStarfish:  2.8,
	native.MobTypeJellyfish: 1,
	native.MobTypeBubble:    0,
	native.MobTypeSponge:    0,
	native.MobTypeShell:     0,
	native.MobTypeCrab:      4,
	native.MobTypeLeech:     8,

	native.MobTypeCentipede:       2.8,
	native.MobTypeCentipedeEvil:   3.2,
	native.MobTypeCentipedeDesert: 11.2,

	native.MobTypeMissileProjectile: 10,
	native.MobTypeWebProjectile:     0,
}

// StaticMobData represents static data of Mob.
type StaticMobData = StaticEntityData[native.MobType]
