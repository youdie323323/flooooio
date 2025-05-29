package wave

import (
	"time"

	"github.com/chewxy/math32"
)

func (p *Petal) PetalCoordinateBoundary(wp *WavePool, _ time.Time) {
	if !p.DetachedFromOrbit {
		return
	}

	mapRadius := float32(wp.Wd.MapRadius)

	desiredMapRadius := mapRadius - p.CalculateRadius()

	dx := p.X - mapRadius
	dy := p.Y - mapRadius

	if math32.Hypot(dx, dy) > desiredMapRadius {
		collisionAngle := math32.Atan2(dy, dx)

		p.X = mapRadius + math32.Cos(collisionAngle)*desiredMapRadius
		p.Y = mapRadius + math32.Sin(collisionAngle)*desiredMapRadius
	}
}
