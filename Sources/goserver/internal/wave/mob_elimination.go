package wave

func (m *Mob) onEliminate(wp *WavePool) {
	wp.RemoveMob(*m.Id)
}

func (m *Mob) MobElimination(wp *WavePool) {
	if !m.WasEliminated(wp) && 0 >= m.Health {
		m.onEliminate(wp)
	}
}

func (m *Mob) InstantlyKill(wp *WavePool) {
	m.Health = 0

	m.onEliminate(wp)
}