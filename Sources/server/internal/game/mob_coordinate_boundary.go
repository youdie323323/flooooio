package game

import (
	"math"
	"slices"

	"flooooio/internal/native"
)

var ProjectileMobTypes = []native.MobType{
	native.MobTypeMissile,
}

func (m *Mob) MobCoordinateBoundary(wp *WavePool) {
	// Eliminate if missile above desiredMapRadius * 1.5
	if slices.Contains(ProjectileMobTypes, m.Type) {
		mapRadius := float64(wp.Wd.MapRadius)

		desiredMapRadius := mapRadius - m.CalculateRadius()

		dx := m.X - float64(mapRadius)
		dy := m.Y - float64(mapRadius)

		if math.Hypot(dx, dy) > desiredMapRadius*1.5 {
			m.ForceEliminate(wp)
		}

		return
	}

	mapRadius := float64(wp.Wd.MapRadius)

	desiredMapRadius := mapRadius - m.CalculateRadius()

	dx := m.X - float64(mapRadius)
	dy := m.Y - float64(mapRadius)

	if math.Hypot(dx, dy) > desiredMapRadius {
		collisionAngle := math.Atan2(dy, dx)

		m.X = mapRadius + math.Cos(collisionAngle)*desiredMapRadius
		m.Y = mapRadius + math.Sin(collisionAngle)*desiredMapRadius
	}
}
