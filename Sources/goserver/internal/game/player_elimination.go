package game

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

func DisposeBindings(wp *WavePool, p *Player) {
	// Remove all petals
	for _, petals := range p.Slots.Surface {
		if petals == nil {
			continue
		}

		for _, petal := range petals {
			if !petal.WasEliminated(wp) {
				petal.SafeForceEliminate(wp)
			}
		}
	}

	// Remove all pets
	for _, pet := range wp.GetMobsWithCondition(func(m *Mob) bool { return m.PetMaster == p }) {
		if pet != nil {
			pet.SafeForceEliminate(wp)
		}
	}

	// Reset all reloads
	p.Slots.ReloadCooldownGrid = GeneratePetalCooldownGrid(len(p.Slots.Surface))
	p.Slots.UsageCooldownGrid = GeneratePetalCooldownGrid(len(p.Slots.Surface))
}

func (p *Player) PlayerElimination(wp *WavePool) {
	if !p.IsDead && 0 >= p.Health {
		p.IsDead = true

		p.Health = 0

		// Stop move
		p.Magnitude = 0

		p.LastDeadCameraUpdate = time.Now()

		DisposeBindings(wp, p)
	}
}
