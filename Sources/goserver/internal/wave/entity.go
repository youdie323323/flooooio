package wave

import (
	"math"
	"math/rand/v2"
	"sync"
)

type Entity struct {
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

	mu sync.RWMutex
}

// RandomAngle returns random angle of entity.
func RandomAngle() float64 {
	return rand.Float64()
}

// RandomId returns random id.
func RandomId() uint32 {
	return rand.Uint32()
}

const tau = math.Pi * 2

// GetRandomSafeCoordinate generates a random safe position
func GetRandomSafeCoordinate(mapRadius float64, safetyDistance float64, clients []*Player) (float64, float64, bool) {
	const maxAttempts = 100

	for range maxAttempts {
		angle := rand.Float64() * tau
		distance := rand.Float64() * (mapRadius - safetyDistance)

		x := mapRadius + math.Cos(angle)*distance
		y := mapRadius + math.Sin(angle)*distance

		isSafe := true

		// Don't spawn on player
		for _, client := range clients {
			dx := client.X - x
			dy := client.Y - y
			distanceToClient := math.Sqrt(dx*dx + dy*dy)
			
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
	angle := rand.Float64() * tau
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

// Nasty mixin like pattern but works
func (e *Entity) OnUpdateTickBase(wp *WavePool) {
	e.mu.Lock()
	
	e.EntityCoordinateMovement(wp)
	e.EntityElimination(wp)

	e.mu.Unlock()
}
