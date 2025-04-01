package wave

func (m *Mob) MobElimination(wp *WavePool) {
	if !m.WasEliminated(wp) && 0 >= m.Health {
		wp.RemoveMob(*m.Id)
	}
}
