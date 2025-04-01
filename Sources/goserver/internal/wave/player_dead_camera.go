package wave

import (
	"time"
)

func getCameraTargets(wp *WavePool) []Node {
	var cameraTargets []Node

	{ // Add camera targets
		mobs := wp.GetMobsWithCondition(func(m *Mob) bool { return m.PetMaster == nil })
		players := wp.GetPlayersWithCondition(func(p2 *Player) bool { return /* p2.Id != p.Id && */ !p2.IsDead })

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

const playerDeadCameraSwitchAfterMS = 500

func (p *Player) PlayerDeadCamera(wp *WavePool) {
	if !p.IsDead {
		return
	}

	isFindable := p.DeadCameraTarget == nil || // Theres no DeadCameraTarget
		IsDeadNode(wp, p.DeadCameraTarget) // Camera target dead, reroll target

	if isFindable {
		if p.DeadCameraTimer == nil {
			p.DeadCameraTimer = time.AfterFunc(playerDeadCameraSwitchAfterMS*time.Millisecond, func() {
				defer func() {
					// Set camera timer to nil
					p.DeadCameraTimer = nil
				}()

				// Dont change camera if player is not dead
				if !p.IsDead {
					return
				}

				p.DeadCameraTarget = FindNearestEntity(p, getCameraTargets(wp))
			})
		}
	} else {
		p.X = p.DeadCameraTarget.GetX()
		p.Y = p.DeadCameraTarget.GetY()
	}
}
