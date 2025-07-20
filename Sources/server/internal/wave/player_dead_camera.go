package wave

import (
	"slices"
	"time"

	"flooooio/internal/wave/collision"
)

// getCameraTargets returns target to camera.
func getCameraTargets(wp *WavePool) []collision.Node {
	return slices.Concat(
		collision.ToNodeSlice(wp.FilterMobsWithCondition(func(m *Mob) bool { return m.IsEnemy() })),
		collision.ToNodeSlice(wp.FilterPlayersWithCondition(func(p2 *Player) bool { return !p2.IsDead })),
	)
}

const deadCameraSwitchAfterMS = 500

func (p *Player) PlayerDeadCamera(wp *WavePool, now time.Time) {
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
		if now.Sub(p.LastDeadCameraUpdate) >= deadCameraSwitchAfterMS*time.Millisecond {
			p.DeadCameraTarget = FindNearestEntity(p, getCameraTargets(wp))
		}
	} else {
		p.X = p.DeadCameraTarget.GetX()
		p.Y = p.DeadCameraTarget.GetY()
	}
}
