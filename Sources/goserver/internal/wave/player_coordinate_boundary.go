package wave

import (
	"math"
)

const playerCoordinateBoundaryKnockback = 15

func (p *Player) PlayerCoordinateBoundary(wp *WavePool) {
	// Dont if uncollidable
	if !p.IsCollidable() {
		return
	}

	mapRadius := float64(wp.wd.MapRadius)

	worldRadius := mapRadius - p.Size

	dx := p.X - float64(mapRadius)
	dy := p.Y - float64(mapRadius)

	if math.Hypot(dx, dy) > worldRadius {
		collisionAngle := math.Atan2(dy, dx)

		p.X = mapRadius + math.Cos(collisionAngle)*(worldRadius-playerCoordinateBoundaryKnockback)
		p.Y = mapRadius + math.Sin(collisionAngle)*(worldRadius-playerCoordinateBoundaryKnockback)
	}
}
