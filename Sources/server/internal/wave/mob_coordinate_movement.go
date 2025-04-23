package wave

import (
	"math"
)

func (m *Mob) MobCoordinateMovement(wp *WavePool) {
	if m.Magnitude > 0 {
		rad := angleToRadian(m.Angle)
		speed := m.Magnitude / 255.

		m.X += math.Cos(rad) * speed
		m.Y += math.Sin(rad) * speed
	}
}
