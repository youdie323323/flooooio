package wave

import (
	"math"
)

func (p *Petal) PetalCoordinateBoundary(wp *WavePool) {
	if !p.DetachedFromOrbit {
		return
	}

	mapRadius := float64(wp.wd.MapRadius)

	worldRadius := mapRadius - p.DesiredSize()

	dx := p.X - float64(mapRadius)
	dy := p.Y - float64(mapRadius)

	if math.Hypot(dx, dy) > worldRadius {
		collisionAngle := math.Atan2(dy, dx)

		p.X = mapRadius + math.Cos(collisionAngle)*worldRadius
		p.Y = mapRadius + math.Sin(collisionAngle)*worldRadius
	}
}
