package wave

import (
	"slices"

	"flooooio/internal/native"

	"github.com/chewxy/math32"
)

var ProjectileMobTypes = []native.MobType{
	native.MobTypeMissile,
}

func (m *Mob) MobCoordinateBoundary(wp *WavePool) {
	// Eliminate if missile above desiredMapRadius * 1.5
	if slices.Contains(ProjectileMobTypes, m.Type) {
		mapRadius := float32(wp.Wd.MapRadius)

		desiredMapRadius := mapRadius - m.CalculateRadius()

		dx := m.X - mapRadius
		dy := m.Y - mapRadius

		if math32.Hypot(dx, dy) > desiredMapRadius*1.5 {
			m.ForceEliminate(wp)
		}

		return
	}

	mapRadius := float32(wp.Wd.MapRadius)

	desiredMapRadius := mapRadius - m.CalculateRadius()

	dx := m.X - mapRadius
	dy := m.Y - mapRadius

	if math32.Hypot(dx, dy) > desiredMapRadius {
		collisionAngle := math32.Atan2(dy, dx)

		m.X = mapRadius + math32.Cos(collisionAngle)*desiredMapRadius
		m.Y = mapRadius + math32.Sin(collisionAngle)*desiredMapRadius
	}
}
