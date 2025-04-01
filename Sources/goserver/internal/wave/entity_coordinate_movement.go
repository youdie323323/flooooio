package wave

import (
	"math"
)

func angleToRadian(angle float64) float64 {
	return angle / 255 * Tau
}

func (e *Entity) EntityCoordinateMovement(wp *WavePool) {
	if e.Magnitude > 0 {
		rad := angleToRadian(e.Angle)
		speed := e.Magnitude / 255

		e.X += math.Cos(rad) * speed
		e.Y += math.Sin(rad) * speed
	}
}
