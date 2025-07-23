package wave

import (
	"math/rand/v2"
	"time"
)

func RevivePlayer(wp *Pool, p *Player) {
	if p.IsDead {
		alivePlayers := wp.FilterPlayersWithCondition(func(p2 *Player) bool {
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

func ResetPlayerBindings(wp *Pool, p *Player) {
	// Remove all petals
	for _, petals := range p.Slots.Surface {
		if petals == nil {
			continue
		}

		for _, petal := range petals {
			if petal != nil {
				petal.CompletelyRemove(wp)
			}
		}
	}

	// Reset all reloads
	p.Slots.ReloadCooldownGrid = GeneratePetalCooldownGrid(len(p.Slots.Surface))
	p.Slots.UsageCooldownGrid = GeneratePetalCooldownGrid(len(p.Slots.Surface))
}

func (p *Player) PlayerElimination(wp *Pool, now time.Time) {
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
