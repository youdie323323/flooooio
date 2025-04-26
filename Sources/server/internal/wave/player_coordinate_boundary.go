package wave

import (
	"math"
)

const playerCoordinateBoundaryKnockback = 5

func (p *Player) PlayerCoordinateBoundary(wp *WavePool) {
	// Dont if uncollidable
	if !p.IsCollidable() {
		return
	}

	mapRadius := float64(wp.Wd.MapRadius)
	desiredMapRadius := mapRadius - p.Size

	dx := p.X - mapRadius
	dy := p.Y - mapRadius
	distanceFromCenter := math.Hypot(dx, dy)

	if distanceFromCenter > desiredMapRadius {
		collisionAngle := math.Atan2(dy, dx)
		
		// Calculate how far the player has gone beyond the boundary
		overlap := distanceFromCenter - desiredMapRadius
		
		// Add opposing velocity based on the overlap
		bounceForce := overlap * playerCoordinateBoundaryKnockback

		p.Velocity[0] -= math.Cos(collisionAngle) * bounceForce
		p.Velocity[1] -= math.Sin(collisionAngle) * bounceForce
	}
}