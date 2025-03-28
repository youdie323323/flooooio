package wave

import (
	"flooooio/internal/native"
	"math"
	"slices"
)

var PROJECTILE_MOB_TYPES = []native.MobType{}

func (p *Mob) MobCoordinateBoundary(wp *WavePool) {
	if slices.Contains(PROJECTILE_MOB_TYPES, p.Type) {
		return
	}

	mapRadius := float64(wp.waveData.mapRadius)

	worldRadius := mapRadius - p.GetDesiredSize()

	dx := p.X - float64(mapRadius)
	dy := p.Y - float64(mapRadius)

	if math.Sqrt(dx * dx + dy * dy) > worldRadius {
		collisionAngle := math.Atan2(dy, dx)
		
		p.X = mapRadius + math.Cos(collisionAngle) * worldRadius
		p.Y = mapRadius + math.Sin(collisionAngle) * worldRadius
	}
}
