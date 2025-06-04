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

	for _, n := range nearby {
		op, ok := n.(*Player)
		if !ok {
			continue
		}

		if op.Id == p.Id {
			continue
		}

		// Dont collide to dead/uncollidable player
		if op.IsDead || !op.IsCollidable() {
			continue
		}

		c1player.X = op.X
		c1player.Y = op.Y
		c1player.R = op.Size

		px, py, ok := collision.ComputeCirclePush(c0player, c1player)
		if ok {
			p.Velocity[0] -= px * playerToPlayerKnockbackMultiplier
			p.Velocity[1] -= py * playerToPlayerKnockbackMultiplier

			op.Velocity[0] += px * playerToPlayerKnockbackMultiplier
			op.Velocity[1] += py * playerToPlayerKnockbackMultiplier
		}
	}

	nearby = nil
}
