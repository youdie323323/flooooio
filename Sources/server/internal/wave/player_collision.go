package wave

import (
	"flooooio/internal/collision"
	"flooooio/internal/native"
)

var PlayerCollision = native.EntityCollision{
	Fraction: 25,
	Radius:   25,
}

const playerToPlayerKnockbackForce = 2.5

func (p *Player) PlayerCollision(wp *WavePool) {
	// Dont collide when dead/uncollidable
	if p.IsDead || !p.IsCollidable() {
		return
	}

	c0 := collision.Circle{X: p.X, Y: p.Y, R: p.Size}

	searchRadius := CalculateSearchRadius(PlayerCollision, p.Size)

	nearby := wp.SpatialHash.Search(p.X, p.Y, searchRadius)

	nearby.Range(func(_ uint32, ne collision.Node) bool {
		np, ok := ne.(*Player)
		if !ok {
			return true
		}

		if np.Id == p.Id {
			return true
		}

		// Dont collide to dead/uncollidable player
		if np.IsDead || !np.IsCollidable() {
			return true
		}

		c1 := collision.Circle{X: np.X, Y: np.Y, R: np.Size}

		px, py, ok := collision.ComputeCirclePush(c0, c1)
		if ok {
			p.Velocity[0] -= px * playerToPlayerKnockbackForce
			p.Velocity[1] -= py * playerToPlayerKnockbackForce

			np.Velocity[0] += px * playerToPlayerKnockbackForce
			np.Velocity[1] += py * playerToPlayerKnockbackForce
		}

		return true
	})
}
