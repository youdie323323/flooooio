package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"
)

func removeConnectedSegmentTraversal(wp *WavePool, m *Mob) {
	for _, id := range m.ConnectedSegmentIds {
		if id != nil {
			toDelete := wp.FindMob(*id)
			if toDelete != nil {
				// We want call this first because RemoveMob call Dispose and Dispose clear ConnectedSegmentIds
				removeConnectedSegmentTraversal(wp, toDelete)

				wp.RemoveMob(*id)
			}
		}
	}
}

func (m *Mob) onEliminate(wp *WavePool) {
	// Leech kill all bodies when main dies
	if m.Type == native.MobTypeLeech {
		removeConnectedSegmentTraversal(wp, m)
	}

	// Normal centi / desert centi changes angle when one of their segment is destroyed
	if m.Type == native.MobTypeCentipede || m.Type == native.MobTypeCentipedeDesert {
		if t, ok := IsBodyWithTraversedResult(wp, m); ok && t.TargetEntity == nil {
			t.RotationCounter = RotationCounterGoal
		}
	}

	wp.RemoveMob(*m.Id)
}

func (m *Mob) MobElimination(wp *WavePool, _ time.Time) {
	// Destroy web projectile if reached time
	if m.Type == native.MobTypeWebProjectile &&
		native.PetalProfiles[native.PetalTypeWeb].StatFromRarity(m.Rarity).Extra["duration"] < m.SigmaT {
		m.onEliminate(wp)

		return
	}

	if !m.WasEliminated(wp) && 0 >= m.Health {
		m.onEliminate(wp)

		return
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
