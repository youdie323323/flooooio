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

const DeadzoneRadiusMultiplier = 1.5

func (m *Mob) MobCoordinateBoundary(wp *Pool, _ time.Time) {
	mapRadius := float32(wp.Wd.MapRadius)

	desiredMapRadius := mapRadius - m.Radius()

	dx := m.X - mapRadius
	dy := m.Y - mapRadius

	dot := dx*dx + dy*dy

	deadzone := desiredMapRadius * DeadzoneRadiusMultiplier

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
