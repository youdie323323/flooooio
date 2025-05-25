package wave

import (
	"github.com/chewxy/math32"
)

func (m *Mob) MobCoordinateMovement(wp *WavePool) {
	if m.Magnitude > 0 {
		rad := angleToRadian(m.Angle)
		speed := m.Magnitude / 255.

		m.X += math32.Cos(rad) * speed
		m.Y += math32.Sin(rad) * speed
	}
}
