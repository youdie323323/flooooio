package wave

import (
	"slices"
	"time"

	"github.com/chewxy/math32"
)

// TraverseMobSegments traverse mob segments and return final segment.
func TraverseMobSegments(wp *Pool, m *Mob) *Mob {
	current := m

	for current.ConnectingSegment != nil {
		segment := current.ConnectingSegment

		if segment != nil && !segment.IsEliminated(wp) {
			current = segment
		} else {
			break
		}
	}

	return current
}

// IsBody determinate if segment piece mob is body.
func IsBody(wp *Pool, m *Mob) bool {
	return TraverseMobSegments(wp, m) != m
}

// IsBodyWithResult determinate if segment piece mob is body but returns traversed result too.
func IsBodyWithResult(wp *Pool, m *Mob) (*Mob, bool) {
	t := TraverseMobSegments(wp, m)

	return t, t != m
}

func IsConnectedSegment(m1, m2 *Mob) bool {
	return m1.ConnectingSegment == m2 || m2.ConnectingSegment == m1 ||
		slices.Contains(m1.ConnectedSegmentIds, m2.Id) || slices.Contains(m2.ConnectedSegmentIds, m1.Id)
}

func (m *Mob) MobBodyConnection(wp *Pool, _ time.Time) {
	seg := m.ConnectingSegment
	if seg == nil {
		return
	}

	if IsDeadNode(wp, seg) {
		m.ConnectingSegment = nil

		return
	}

	dx, dy := seg.GetX()-m.X,
		seg.GetY()-m.Y

	currentDistance := math32.Hypot(dx, dy)

	segmentDia := m.Diameter()

	{
		m.Magnitude = 0
		m.Angle = math32.Mod((math32.Atan2(dy, dx)/Tau32)*255+255, 255)

		ratio := 1 - (segmentDia / currentDistance)

		m.X += dx * ratio
		m.Y += dy * ratio
	}
}
