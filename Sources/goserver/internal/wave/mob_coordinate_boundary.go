package wave

import (
	"math"
	"slices"

	"flooooio/internal/native"
)

var PROJECTILE_MOB_TYPES = []native.MobType{}

func (m *Mob) MobCoordinateBoundary(wp *WavePool) {
	if slices.Contains(PROJECTILE_MOB_TYPES, m.Type) {
		return
	}

	mapRadius := float64(wp.wd.MapRadius)

	worldRadius := mapRadius - m.GetDesiredSize()

	dx := m.X - float64(mapRadius)
	dy := m.Y - float64(mapRadius)

	if math.Sqrt(dx*dx+dy*dy) > worldRadius {
		collisionAngle := math.Atan2(dy, dx)

		m.X = mapRadius + math.Cos(collisionAngle)*worldRadius
		m.Y = mapRadius + math.Sin(collisionAngle)*worldRadius
	}
}
