package wave

import (
	"math"
)

func (p *Petal) PetalCoordinateBoundary(wp *WavePool) {
	if !p.DetachedFromOrbit {
		return
	}

	mapRadius := float64(wp.Wd.MapRadius)

	desiredMapRadius := mapRadius - p.CalculateRadius()

	dx := p.X - mapRadius
	dy := p.Y - mapRadius

	if math.Hypot(dx, dy) > desiredMapRadius {
		collisionAngle := math.Atan2(dy, dx)

		p.X = mapRadius + math.Cos(collisionAngle)*desiredMapRadius
		p.Y = mapRadius + math.Sin(collisionAngle)*desiredMapRadius
	}
}
