package wave

import (
	"math/rand/v2"
	"time"
)

func RevivePlayer(wp *WavePool, p *Player) {
	if p.IsDead {
		alivePlayers := wp.GetPlayersWithCondition(func(p2 *Player) bool {
			return p2.Id != p.Id && !p2.IsDead
		})

		if len(alivePlayers) > 0 {
			randAlive := alivePlayers[rand.IntN(len(alivePlayers))]

			x, y := GetRandomCoordinate(
				randAlive.X,
				randAlive.Y,
				200,
			)

			p.Health = 1

			p.IsDead = false

			p.X = x
			p.Y = y

			p.DeadCameraTarget = nil
		}
	}
}

func ResetPlayerBindings(wp *WavePool, p *Player) {
	// Remove all petals
	for _, ps := range p.Slots.Surface {
		if ps == nil {
			continue
		}

		for _, p := range ps {
			if p == nil {
				continue
			}

			p.CompletelyRemove(wp)
		}
	}

	// Reset all reloads
	p.Slots.ReloadCooldownGrid = GeneratePetalCooldownGrid(len(p.Slots.Surface))
	p.Slots.UsageCooldownGrid = GeneratePetalCooldownGrid(len(p.Slots.Surface))
}

func (p *Player) PlayerElimination(wp *WavePool, now time.Time) {
	if !p.IsDead && 0 >= p.Health {
		p.IsDead = true

		p.Health = 0

		// Stop move
		p.Magnitude = 0

		p.LastDeadCameraUpdate = now

		p.IsPoisoned.Store(false)

		ResetPlayerBindings(wp, p)
	}
}
