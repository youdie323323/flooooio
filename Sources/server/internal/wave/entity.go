package wave

import (
	"math/rand/v2"
	"sync"

	"github.com/chewxy/math32"

	"flooooio/internal/collision"
)

type EntityId = uint32

type Entity struct {
	// Id is unique identifier of entity.
	Id *EntityId

	// X is x-pos of entity.
	X float32
	// Y is y-pos of entity.
	Y float32

	// Magnitude is size of movement.
	Magnitude float32
	// Angle is angle of movement.
	Angle float32

	// Size is size of entity.
	Size float32

	// Health is health of entity.
	// Range will be [0, 1] float range.
	Health float32

	Mu sync.RWMutex
}

// GetRandomAngle returns random angle of entity.
func GetRandomAngle() float32 {
	return rand.Float32() * 255
}

// GetRandomId returns random id.
func GetRandomId() uint32 {
	return rand.Uint32()
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

		Magnitude: 0,
		Angle:     GetRandomAngle(),

		Size: size,

		// Max health
		Health: 1,
	}
}

// LightningEmitter is lightning emitter (like jellyfish, lightning)
type LightningEmitter interface {
	GetLightningBounceTargets(wp *WavePool, bouncedIds []*EntityId) []collision.Node
}

const Tau = math32.Pi * 2

// GetRandomSafeCoordinate generates a random safe position
func GetRandomSafeCoordinate(mapRadius float32, safetyDistance float32, clients []*Player) (float32, float32, bool) {
	const maxAttempts = 100

	for range maxAttempts {
		angle := rand.Float32() * Tau
		distance := rand.Float32() * (mapRadius - safetyDistance)

		x := mapRadius + math32.Cos(angle)*distance
		y := mapRadius + math32.Sin(angle)*distance

		isSafe := true

		// Don't spawn on player
		for _, client := range clients {
			dx := client.X - x
			dy := client.Y - y
			distanceToClient := math32.Hypot(dx, dy)

			if distanceToClient < safetyDistance+client.Size {
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

// GetRandomCoordinate generates a random position
func GetRandomCoordinate(centerX, centerY, spawnRadius float32) (float32, float32) {
	angle := rand.Float32() * Tau
	distance := (0.5 + rand.Float32()*0.5) * spawnRadius

	x := centerX + math32.Cos(angle)*distance
	y := centerY + math32.Sin(angle)*distance

	return x, y
}

// Methods that satisfy spatial hash's Node.

func (e *Entity) GetX() float32 {
	return e.X
}

func (e *Entity) GetY() float32 {
	return e.Y
}

func (e *Entity) GetID() uint32 {
	return *e.Id
}

func (e *Entity) GetMagnitude() float32 {
	return e.Magnitude
}

func (e *Entity) GetAngle() float32 {
	return e.Angle
}

// IsDeadNode determine if Node is dead.
func IsDeadNode(wp *WavePool, n collision.Node) bool {
	switch e := n.(type) {
	case *Petal:
	case *Mob:
		return e.WasEliminated(wp)

	case *Player:
		return e.IsDead
	}

	return true
}
