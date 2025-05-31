package wave

import (
	"time"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"
)

var PlayerCollision = native.EntityCollision{
	Fraction: 25,
	Radius:   25,
}

const playerToPlayerKnockbackMultiplier = 2.5

// Define reusable circle
var (
	c0player collision.Circle
	c1player collision.Circle
)

func (p *Player) PlayerCollision(wp *WavePool, _ time.Time) {
	// Dont collide when dead/uncollidable
	if p.IsDead || !p.IsCollidable() {
		return
	}

	c0player.X = p.X
	c0player.Y = p.Y
	c0player.R = p.Size

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

		c1player.X = np.X
		c1player.Y = np.Y
		c1player.R = np.Size

		px, py, ok := collision.ComputeCirclePush(c0player, c1player)
		if ok {
			p.Velocity[0] -= px * playerToPlayerKnockbackMultiplier
			p.Velocity[1] -= py * playerToPlayerKnockbackMultiplier

			np.Velocity[0] += px * playerToPlayerKnockbackMultiplier
			np.Velocity[1] += py * playerToPlayerKnockbackMultiplier
		}

		return true
	})
}
