package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

var ProjectileMobTypes = []native.MobType{
	native.MobTypeMissileProjectile,
	native.MobTypeWebProjectile,
}

const missileEliminateRadiusMultiplier = 1.5

func (m *Mob) MobCoordinateBoundary(wp *WavePool, _ time.Time) {
	mapRadius := float32(wp.Wd.MapRadius)

	desiredMapRadius := mapRadius - m.CalculateRadius()

	dx := m.X - mapRadius
	dy := m.Y - mapRadius

	dot := dx*dx + dy*dy

	if m.IsProjectile() {
		// Eliminate if missile above desiredMapRadius * 1.5
		projectileLimit := desiredMapRadius * missileEliminateRadiusMultiplier

		if dot > projectileLimit*projectileLimit {
			m.ForceEliminate(wp)
		}
	} else {
		if dot > desiredMapRadius*desiredMapRadius {
			collisionAngle := math32.Atan2(dy, dx)

			m.X = mapRadius + math32.Cos(collisionAngle)*desiredMapRadius
			m.Y = mapRadius + math32.Sin(collisionAngle)*desiredMapRadius
		}
	}
}
