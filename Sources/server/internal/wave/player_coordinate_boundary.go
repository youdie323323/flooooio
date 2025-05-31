package wave

import (
	"time"

	"github.com/chewxy/math32"
)

const bounaryKnockback = 5

func (p *Player) PlayerCoordinateBoundary(wp *WavePool, _ time.Time) {
	// Dont if uncollidable
	if !p.IsCollidable() {
		return
	}

	mapRadius := float32(wp.Wd.MapRadius)
	desiredMapRadius := mapRadius - p.Size

	dx := p.X - mapRadius
	dy := p.Y - mapRadius
	distanceFromCenter := math32.Hypot(dx, dy)

	if distanceFromCenter > desiredMapRadius {
		collisionAngle := math32.Atan2(dy, dx)

		// Calculate how far the player has gone beyond the boundary
		overlap := distanceFromCenter - desiredMapRadius

		// Add opposing velocity based on the overlap
		bounceForce := min(overlap*bounaryKnockback, desiredMapRadius)

		p.Velocity[0] -= math32.Cos(collisionAngle) * bounceForce
		p.Velocity[1] -= math32.Sin(collisionAngle) * bounceForce
	}
}
