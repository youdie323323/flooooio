package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"
)

// removeConnectedSegmentTraversal removes each mob of segment chain.
func removeConnectedSegmentTraversal(wp *Pool, m *Mob) {
	for _, id := range m.ConnectedSegmentIds {
		if toDelete := wp.FindMob(id); toDelete != nil {
			// We want call this first because RemoveMob call Dispose and Dispose clear ConnectedSegmentIds
			removeConnectedSegmentTraversal(wp, toDelete)

			wp.RemoveMob(id)
		}
	}
}

func (m *Mob) onEliminate(wp *Pool) {
	// Leech kill all bodies when head dies
	if m.Type == native.MobTypeLeech {
		removeConnectedSegmentTraversal(wp, m)
	}

	// Normal centi / desert centi changes angle when one of their segment is destroyed (or it isnt?)
	if m.Type == native.MobTypeCentipede || m.Type == native.MobTypeCentipedeDesert {
		if t, ok := IsBodyWithResult(wp, m); ok && t.TargetEntity == nil {
			t.RotationCounter = RotationCounterGoal
		}
	}

	wp.RemoveMob(m.Id)
}

func (m *Mob) MobElimination(wp *Pool, _ time.Time) {
	// Destroy web projectile if reached lifespan
	if m.Type == native.MobTypeWebProjectile &&
		native.PetalProfiles[native.PetalTypeWeb].StatFromRarity(m.Rarity).Extra["duration"] < m.T {
		m.onEliminate(wp)

		return
	}

	if !m.IsEliminated(wp) && 0 >= m.Health {
		m.onEliminate(wp)

		return
	}
}

// ForceEliminate forces eliminate a mob.
//
// Warning: This behaves the same as when this mob is "naturally" removed.
// This mean binded entities may also be deleted. If this behavior is not desired, use wp.RemovePetal instead.
func (m *Mob) ForceEliminate(wp *Pool) {
	m.Health = 0

	m.onEliminate(wp)
}
