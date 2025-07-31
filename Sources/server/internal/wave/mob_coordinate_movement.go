package wave

import (
	"time"

	"github.com/chewxy/math32"
)

func (m *Mob) MobCoordinateMovement(wp *Pool, _ time.Time) {
	if m.Magnitude > 0 {
		radian := AngleToRadian(m.Angle)
		speed := (m.MagnitudeMultiplier * m.Magnitude) / 255.

		m.X += math32.Cos(radian) * speed
		m.Y += math32.Sin(radian) * speed
	}
}
