package game

import (
	"math"
	"math/rand/v2"
	"sync"

	"flooooio/internal/collision"
)

type EntityId = uint32

type Entity struct {
	// Id is unique identifier of entity.
	Id *EntityId

	// X is x-pos of entity.
	X float64
	// Y is y-pos of entity.
	Y float64

	// Magnitude is size of movement.
	Magnitude float64
	// Angle is angle of movement.
	Angle float64

	// Size is size of entity.
	Size float64

	// Health is health of entity.
	// Range will be [0, 1] float range.
	Health float64

	Mu sync.RWMutex
}

// GetRandomAngle returns random angle of entity.
func GetRandomAngle() float64 {
	return rand.Float64() * 255
}

// GetRandomId returns random id.
func GetRandomId() uint32 {
	return rand.Uint32()
}

func NewEntity(
	id *EntityId,

	x float64,
	y float64,

	size float64,
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

const Tau = math.Pi * 2

// GetRandomSafeCoordinate generates a random safe position
func GetRandomSafeCoordinate(mapRadius float64, safetyDistance float64, clients []*Player) (float64, float64, bool) {
	const maxAttempts = 100

	for range maxAttempts {
		angle := rand.Float64() * Tau
		distance := rand.Float64() * (mapRadius - safetyDistance)

		x := mapRadius + math.Cos(angle)*distance
		y := mapRadius + math.Sin(angle)*distance

		isSafe := true

		// Don't spawn on player
		for _, client := range clients {
			dx := client.X - x
			dy := client.Y - y
			distanceToClient := math.Hypot(dx, dy)

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
func GetRandomCoordinate(centerX, centerY, spawnRadius float64) (float64, float64) {
	angle := rand.Float64() * Tau
	distance := (0.5 + rand.Float64()*0.5) * spawnRadius

	x := centerX + math.Cos(angle)*distance
	y := centerY + math.Sin(angle)*distance

	return x, y
}

// Methods that satisfy spatial hash's Node.

func (e *Entity) GetX() float64 {
	return e.X
}

func (e *Entity) GetY() float64 {
	return e.Y
}

func (e *Entity) GetID() uint32 {
	return *e.Id
}

func (e *Entity) GetMagnitude() float64 {
	return e.Magnitude
}

func (e *Entity) GetAngle() float64 {
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
