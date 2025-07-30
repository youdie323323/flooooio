package wave

import (
	"slices"
	"time"

	"github.com/youdie323323/go-spatial-hash"
)

// findCameraTargets returns camera targets.
func findCameraTargets(wp *Pool) PoolNodeSlice {
	return slices.Concat(
		spatial_hash.ToNodeSlice(wp.FilterMobsWithCondition(func(m *Mob) bool { return m.IsEnemy() })),
		spatial_hash.ToNodeSlice(wp.FilterPlayersWithCondition(func(p2 *Player) bool { return !p2.IsDead })),
	)
}

const playerDeadCameraSwitchAfter = 500 * time.Millisecond

func (p *Player) PlayerDeadCamera(wp *Pool, now time.Time) {
	if !p.IsDead {
		return
	}

	isCameraDead := IsDeadNode(wp, p.DeadCameraTarget)

	isFindable := p.DeadCameraTarget == nil || isCameraDead

	if isCameraDead && p.DeadCameraTarget != nil {
		p.DeadCameraTarget = nil

		p.LastDeadCameraUpdate = now

		return
	}

	if isFindable {
		if now.Sub(p.LastDeadCameraUpdate) >= playerDeadCameraSwitchAfter {
			p.DeadCameraTarget = FindNearestEntity(p, findCameraTargets(wp))
		}
	} else {
		p.X = p.DeadCameraTarget.GetX()
		p.Y = p.DeadCameraTarget.GetY()
	}
}
