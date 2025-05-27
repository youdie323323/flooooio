package wave

import (
	"flooooio/internal/native"
)

func removeConnectedSegmentTraversal(wp *WavePool, m *Mob) {
	for _, id := range m.ConnectedSegmentIds {
		toDelete := wp.FindMob(*id)
		if toDelete != nil {
			// We want call this first because RemoveMob call Dispose and Dispose clear ConnectedSegmentIds
			removeConnectedSegmentTraversal(wp, toDelete)

			wp.RemoveMob(*id)
		}
	}
}

func (m *Mob) onEliminate(wp *WavePool) {
	// Leech kill all bodies when main dies
	if m.Type == native.MobTypeLeech {
		removeConnectedSegmentTraversal(wp, m)
	}

	// Pre-automatic remove
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
