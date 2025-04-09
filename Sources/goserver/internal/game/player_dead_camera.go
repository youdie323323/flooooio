package game

import (
	"time"
)

func getCameraTargets(wp *WavePool) []Node {
	var cameraTargets []Node

	{ // Add camera targets
		// Or just, all mobs
		mobs := wp.GetMobsWithCondition(func(m *Mob) bool { return m.IsEnemy() })
		players := wp.GetPlayersWithCondition(func(p2 *Player) bool { return !p2.IsDead })

		mobsLen := len(mobs)
		playersLen := len(players)

		cameraTargets = make([]Node, mobsLen+playersLen)

		for i, mob := range mobs {
			cameraTargets[i] = mob
		}

		for i, player := range players {
			cameraTargets[mobsLen+i] = player
		}
	}

	return cameraTargets
}

const deadCameraSwitchAfterMS = 500

func (p *Player) PlayerDeadCamera(wp *WavePool) {
	if !p.IsDead {
		return
	}

	// TODO: set now to LastDeadCameraUpdate if IsDeadNode(wp, p.DeadCameraTarget)

	isFindable := p.DeadCameraTarget == nil || IsDeadNode(wp, p.DeadCameraTarget)

	if isFindable {
		now := time.Now()

		if now.Sub(p.LastDeadCameraUpdate) >= deadCameraSwitchAfterMS*time.Millisecond {
			p.DeadCameraTarget = FindNearestEntity(p, getCameraTargets(wp))

			p.LastDeadCameraUpdate = now
		}
	} else {
		p.X = p.DeadCameraTarget.GetX()
		p.Y = p.DeadCameraTarget.GetY()
	}
}
