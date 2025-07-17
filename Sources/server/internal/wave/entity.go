package wave

import (
	"math/rand/v2"
	"sync"
	"sync/atomic"

	"github.com/chewxy/math32"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"
)

type Velocity = [2]float32

type EntityId = uint16

type Entity struct {
	// Id is unique identifier of entity.
	Id *EntityId

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
	Health float32

	Mu sync.RWMutex
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

// TODO: wrap all poison damages into TakePoisonDamage

// StaticEntityData represents static entity data.
type StaticEntityData[T ~uint8] struct {
	Type   T
	Rarity native.Rarity
}

// GetRandomAngle returns random angle of entity.
func GetRandomAngle() float32 {
	return rand.Float32() * 255
}

// GetRandomId returns random id.
func GetRandomId() uint16 {
	return rand.N[uint16](65535)
}

func NewEntity(
	id *EntityId,

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
		Angle:     GetRandomAngle(),

		Size: size,

		// Max health
		Health: 1,
	}
}

// LightningEmitter is lightning emitter (like jellyfish, lightning).
type LightningEmitter interface {
	GetLightningBounceTargets(wp *WavePool, bouncedIds []*EntityId) []collision.Node
}

const Tau = 2 * math32.Pi

// GetRandomSafeCoordinate generates a random safe position.
func GetRandomSafeCoordinate(mapRadius float32, safetyDistance float32, clients []*Player) (float32, float32, bool) {
	const maxAttempts = 100

	for range maxAttempts {
		angle := rand.Float32() * Tau
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
	angle := rand.Float32() * Tau
	distance := (0.5 + 0.5*rand.Float32()) * spawnRadius

	x := spawnRadius + math32.Cos(angle)*distance
	y := spawnRadius + math32.Sin(angle)*distance

	return x, y
}

// Methods that satisfies spatial hashes Node

func (e *Entity) GetId() uint16 {
	return *e.Id
}

func (e *Entity) GetX() float32 {
	return e.X
}

func (e *Entity) GetY() float32 {
	return e.Y
}

func (e *Entity) SetOldPos(x, y float32) {
	e.oldX = x
	e.oldY = y
}

func (e *Entity) GetOldPos() (float32, float32) {
	return e.oldX, e.oldY
}

// IsDeadNode determine if Node is dead.
func IsDeadNode(wp *WavePool, n collision.Node) bool {
	switch e := n.(type) {
	case *Mob:
		return e.WasEliminated(wp)

	case *Petal:
		return e.WasEliminated(wp)

	case *Player:
		return e.IsDead
	}

	return true
}
