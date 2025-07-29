package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"
)

var PlayerCollision = native.EntityCollision{
	Fraction: 25,
	Radius:   25,
}

const playerToPlayerKnockbackMultiplier = 2.5

func (p *Player) PlayerCollision(wp *Pool, _ time.Time) {
	// Dont collide when dead/uncollidable
	if p.IsDead || !p.IsCollidable() {
		return
	}

	pId := p.Id

	c0player := Circle{
		X: p.X,
		Y: p.Y,
		R: p.Size,
	}

	// Define reusable circle
	c1player := Circle{}

	searchRadius := CalculateSearchRadius(PlayerCollision, p.Size)

	nearby := wp.SpatialHash.Search(p.X, p.Y, searchRadius)

	for _, n := range nearby {
		// Player -> Player
		op, ok := n.(*Player)
		if !ok {
			continue
		}

		if op.Id == pId {
			continue
		}

		// Dont collide to dead/uncollidable player
		if op.IsDead || !op.IsCollidable() {
			continue
		}

		c1player.X = op.X
		c1player.Y = op.Y
		c1player.R = op.Size

		px, py, ok := ComputeCirclePush(c0player, c1player)
		if ok {
			p.Velocity[0] -= px * playerToPlayerKnockbackMultiplier
			p.Velocity[1] -= py * playerToPlayerKnockbackMultiplier

			op.Velocity[0] += px * playerToPlayerKnockbackMultiplier
			op.Velocity[1] += py * playerToPlayerKnockbackMultiplier
		}
	}

	nearby = nil
}
