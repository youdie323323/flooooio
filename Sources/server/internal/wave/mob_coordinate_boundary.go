package wave

import (
	"time"

	"github.com/chewxy/math32"
)

const MobDeadzoneExpand = 1.5

func (m *Mob) MobCoordinateBoundary(wp *Pool, _ time.Time) {
	mapRadius := float32(wp.Data.MapRadius)

	desiredMapRadius := mapRadius - m.Radius()

	dx, dy := m.X-mapRadius, m.Y-mapRadius

	dot := dx*dx + dy*dy

	deadzone := desiredMapRadius * MobDeadzoneExpand

	if dot > deadzone*deadzone {
		m.ForceEliminate(wp)

		return
	}

	if !m.IsProjectile() && dot > desiredMapRadius*desiredMapRadius {
		collisionAngle := math32.Atan2(dy, dx)

		m.X = mapRadius + math32.Cos(collisionAngle)*desiredMapRadius
		m.Y = mapRadius + math32.Sin(collisionAngle)*desiredMapRadius
	}
}
