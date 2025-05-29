package wave

import (
	"slices"
	"time"

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

func IsConnectedSegment(m1, m2 *Mob) bool {
	if m1.ConnectingSegment == m2 || m2.ConnectingSegment == m1 {
		return true
	}

	return slices.Contains(m1.ConnectedSegmentIds, m2.Id) || slices.Contains(m2.ConnectedSegmentIds, m1.Id)
}

func (m *Mob) MobBodyConnection(wp *WavePool, _ time.Time) {
	seg := m.ConnectingSegment
	if seg == nil {
		return
	}

	if IsDeadNode(wp, seg) {
		m.ConnectingSegment = nil

		return
	}

	dx := seg.GetX() - m.X
	dy := seg.GetY() - m.Y

	currentDistance := math32.Hypot(dx, dy)

	segmentDia := m.CalculateDiameter()

	{
		m.Magnitude = 0
		m.Angle = math32.Mod((math32.Atan2(dy, dx)/Tau)*255+255, 255)

		ratio := 1 - (segmentDia / currentDistance)

		m.X += dx * ratio
		m.Y += dy * ratio
	}
}
