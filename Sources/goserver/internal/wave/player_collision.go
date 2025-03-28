package wave

import (
	"flooooio/internal/native"
)

var playerDefaultSearchData = native.EntityCollision{
	Fraction: 25,
	Radius:   25,
}

func (p *Player) PlayerCollision(wp *WavePool) {
	// Dont collide when dead/uncollidable
	if p.IsDead || !p.IsCollidable() {
		return
	}

	c0 := circle{p.X, p.Y, p.Size}

	searchRadius := calculateSearchRadius(playerDefaultSearchData, p.Size)

	nearby := wp.SpatialHash.Search(p.X, p.Y, searchRadius)

	for _, ne := range nearby {
		np, ok := ne.(*Player)
		if !ok {
			continue
		}

		if np.Id == p.Id {
			continue
		}

		// Dont collide to dead/uncollidable player
		if np.IsDead || !np.IsCollidable() {
			continue
		}

		c1 := circle{np.X, np.Y, np.Size}

		px, py, ok := computeCirclePush(c0, c1)
		if ok {
			p.X -= px * 1.25
			p.Y -= py * 1.25

			np.X += px * 1.25
			np.Y += py * 1.25
		}
	}
}
