package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"
)

func removeConnectedSegmentTraversal(wp *Pool, m *Mob) {
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

	wp.RemoveMob(*m.Id)
}

func (m *Mob) MobElimination(wp *Pool, _ time.Time) {
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
// Warning: This behaves the same as when this mob is "naturally" removed.
// This mean binded entities may also be deleted. If this behavior is not desired, use wp.RemovePetal instead.
func (m *Mob) ForceEliminate(wp *Pool) {
	m.Health = 0

	m.onEliminate(wp)
}
