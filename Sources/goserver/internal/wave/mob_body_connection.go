package wave

import (
	"math"

	"flooooio/internal/native"
)

// traverseMobSegments traverse mob segments and return final segment.
func traverseMobSegments(wp *WavePool, m *Mob) *Mob {
	if m.ConnectingSegment != nil {
		if segment, ok := m.ConnectingSegment.(*Mob); ok && !segment.WasEliminated(wp) {
			return traverseMobSegments(wp, segment)
		}
	}

	return m
}

// isBody determinate if segment piece mob is body.
func isBody(wp *WavePool, m *Mob) bool {
	return traverseMobSegments(wp, m) != m
}

func (m *Mob) MobBodyConnection(wp *WavePool) {
	if m.ConnectingSegment == nil {
		return
	}

	if IsDeadNode(wp, m.ConnectingSegment) {
		m.ConnectingSegment = nil

		return
	}

	dx := m.ConnectingSegment.GetX() - m.X
	dy := m.ConnectingSegment.GetY() - m.Y

	mc := native.MobProfiles[m.Type].Collision

	// Arc
	segmentDistance := (mc.Radius * 2) * (m.Size / mc.Fraction)

	currentDistance := math.Hypot(dx, dy)

	if currentDistance > segmentDistance {
		m.Magnitude = 0
		m.Angle = math.Mod((math.Atan2(dy, dx)/tau)*255+255, 255)

		ratio := (currentDistance - segmentDistance) / currentDistance
		m.X += dx * ratio
		m.Y += dy * ratio
	}
}
