package wave

import (
	"math"
	"math/rand/v2"
	"sync"
	"sync/atomic"

	"github.com/chewxy/math32"

	"flooooio/internal/wave/florr/native"
)

type Vector2 = [2]float32

type EntityId = uint16

type Entity struct {
	// Id is unique identifier of entity.
	Id EntityId

	// X, Y is position of entity.
	X, Y float32

	// oldX, oldY is old position store for spatial hash.
	// This should not accessed from outside.
	oldX, oldY float32

	// Magnitude is size of movement.
	Magnitude float32
	// Angle is angle of movement.
	Angle float32

	// Size is size of entity.
	Size float32

	// Health is health of entity.
	// Range will be [0, 1] float.
	// If you want to take proper-damage (not likely poison damage), use TakeProperDamage.
	Health float32

	// WasProperDamaged whether this entity is proper-damaged this frame.
	WasProperDamaged bool

	Mu sync.RWMutex
}

type Eliminatable interface {
	// IsEliminated returns whether if entity is eliminated.
	IsEliminated(wp *Pool) bool
}

// LightningEmitter is lightning emitter (like jellyfish, lightning petal).
type LightningEmitter interface {
	// SearchLightningBounceTargets searches for bounce target.
	SearchLightningBounceTargets(wp *Pool, bouncedIds []EntityId) PoolNodeSlice
}

type Poisonable struct {
	IsPoisoned atomic.Bool
	// PoisonDPS is damage per second of poison.
	PoisonDPS float32
	// TotalPoison is total damage by poison.
	TotalPoison float32
	// StopAtPoison is poison is stopped if reached this.
	StopAtPoison float32
}

// NewPoisonable returns basic poison information.
func NewPoisonable() Poisonable {
	return Poisonable{
		PoisonDPS:    0,
		TotalPoison:  0,
		StopAtPoison: 0,
	}
}

func (e *Entity) TakeProperDamage(damage float32) {
	e.Health -= damage

	e.WasProperDamaged = true
}

// ConsumeWasProperDamage consumes WasDamaged.
// This method should only called once for each frame step.
func (e *Entity) ConsumeWasProperDamage() bool {
	wasDamaged := e.WasProperDamaged

	e.WasProperDamaged = false

	return wasDamaged
}

// TODO: wrap all poison damages into TakePoisonDamage

// StaticEntityData represents static entity data.
type StaticEntityData[T ~uint8] struct {
	Type   T
	Rarity native.Rarity
}

// RandomAngle returns random entity angle.
func RandomAngle() float32 {
	return rand.Float32() * 255
}

// RandomId returns random entity id.
func RandomId() EntityId {
	return rand.N[EntityId](65535)
}

func NewEntity(
	id EntityId,

	x float32,
	y float32,

	size float32,
) Entity {
	return Entity{
		Id: id,

		X: x,
		Y: y,

		oldX: x,
		oldY: y,

		Magnitude: 0,
		Angle:     RandomAngle(),

		Size: size,

		// Max health
		Health: 1,
	}
}

const (
	Tau32 = 2 * math32.Pi
	Tau   = 2 * math.Pi
)

// GetRandomSafeCoordinate generates a random safe position.
func GetRandomSafeCoordinate(mapRadius float32, safetyDistance float32, clients []*Player) (float32, float32, bool) {
	const maxAttempts = 100

	for range maxAttempts {
		angle := rand.Float32() * Tau32
		distance := rand.Float32() * (mapRadius - safetyDistance)

		x := mapRadius + math32.Cos(angle)*distance
		y := mapRadius + math32.Sin(angle)*distance

		isSafe := true

		// Dont spawn on player
		for _, c := range clients {
			dx := c.X - x
			dy := c.Y - y

			safeSafetyDistance := safetyDistance + c.Size

			if (dx*dx + dy*dy) < (safeSafetyDistance * safeSafetyDistance) {
				isSafe = false

				break
			}
		}

		if isSafe {
			return x, y, true
		}
	}

	return 0, 0, false
}

// GetRandomCoordinate generates a random position.
func GetRandomCoordinate(cx, cy, spawnRadius float32) (float32, float32) {
	angle := rand.Float32() * Tau32
	distance := (0.5 + 0.5*rand.Float32()) * spawnRadius

	return distance*math32.Cos(angle) + spawnRadius,
		distance*math32.Sin(angle) + spawnRadius
}

// Methods that satisfies spatial hash Node

var _ PoolNode = (*Entity)(nil) // *Entity must implement PoolNode

func (e *Entity) GetId() EntityId { return e.Id }

func (e *Entity) GetX() float32 { return e.X }
func (e *Entity) GetY() float32 { return e.Y }

func (e *Entity) SetOldPos(x, y float32)        { e.oldX, e.oldY = x, y }
func (e *Entity) GetOldPos() (float32, float32) { return e.oldX, e.oldY }

// IsDeadNode returns whether if PoolNode is dead.
func IsDeadNode(wp *Pool, n PoolNode) bool {
	switch e := n.(type) {
	case *Mob:
		return e.IsEliminated(wp)

	case *Petal:
		return e.IsEliminated(wp)

	case *Player:
		return e.IsEliminated(wp)
	}

	return true
}
