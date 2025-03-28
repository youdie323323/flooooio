package wave

import "math/rand/v2"

func (m *Mob) MobElimination(wp *WavePool) {
	if !IsDeadNode(wp, m) && 0 >= m.Health {
		wp.RemoveMob(*m.Id)
	}
}

func RevivePlayer(wp *WavePool, p *Player) {
	if p.IsDead {
		alivePlayers := wp.SafeGetPlayersWithCondition(func(p2 *Player) bool {
			return p2.Id != p.Id && !p2.IsDead
		})

		if len(alivePlayers) > 0 {
			randAlive := alivePlayers[rand.IntN(len(alivePlayers))]

			x, y := GetRandomCoordinate(
				randAlive.X,
				randAlive.Y,
				200,
			)

			p.Health = p.CalculateMaxHealth()

			p.IsDead = false

			p.X = x
			p.Y = y

			// TODO: disable dead camera
		}
	}
}
