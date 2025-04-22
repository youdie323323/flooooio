package game

func (m *Mob) onEliminate(wp *WavePool) {
	wp.RemoveMob(*m.Id)
}

func (m *Mob) MobElimination(wp *WavePool) {
	if !m.WasEliminated(wp) && 0 >= m.Health {
		m.onEliminate(wp)
	}
}

// ForceEliminate forces eliminate a mob.
//
// Warning: This behaves the same as when it is "naturally" removed.
// What this means is that binded entities may also be deleted. If this is not desired, use wp.RemoveMob instead.
func (m *Mob) ForceEliminate(wp *WavePool) {
	m.Health = 0

	m.onEliminate(wp)
}

func (m *Mob) SafeForceEliminate(wp *WavePool) {
	m.Mu.Lock()

	m.ForceEliminate(wp)

	m.Mu.Unlock()
}
