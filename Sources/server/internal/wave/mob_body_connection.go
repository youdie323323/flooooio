package wave

import (
	"github.com/chewxy/math32"
)

// TraverseMobSegments traverse mob segments and return final segment.
func TraverseMobSegments(wp *WavePool, m *Mob) *Mob {
	if m.ConnectingSegment != nil {
		if segment, ok := m.ConnectingSegment.(*Mob); ok && !segment.WasEliminated(wp) {
			return TraverseMobSegments(wp, segment)
		}
	}

	return m
}

// IsBody determinate if segment piece mob is body.
func IsBody(wp *WavePool, m *Mob) bool {
	return TraverseMobSegments(wp, m) != m
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

	currentDistance := math32.Hypot(dx, dy)

	segmentDia := m.CalculateDiameter()

	if currentDistance > segmentDia {
		m.Magnitude = 0
		m.Angle = math32.Mod((math32.Atan2(dy, dx)/Tau)*255+255, 255)

		ratio := (currentDistance - segmentDia) / currentDistance
		
		m.X += dx * ratio
		m.Y += dy * ratio
	}
}
