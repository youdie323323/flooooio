package wave

import (
	"time"

	"github.com/chewxy/math32"
)

func (m *Mob) MobCoordinateMovement(wp *WavePool, _ time.Time) {
	if m.Magnitude > 0 {
		rad := angleToRadian(m.Angle)
		speed := (m.Magnitude * m.MagnitudeMultiplier) / 255.

		m.X += math32.Cos(rad) * speed
		m.Y += math32.Sin(rad) * speed
	}
}
