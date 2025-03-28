package wave

import (
	"math"

	"flooooio/internal/collision"
	"flooooio/internal/native"
)

// findNearestEntity finds the nearest entity from a slice of entities.
func findNearestEntity(me collision.Node, entities []collision.Node) collision.Node {
	if len(entities) == 0 {
		return nil
	}

	nearest := entities[0]
	for _, current := range entities[1:] {
		distanceToCurrent := math.Hypot(
			current.GetX()-me.GetX(),
			current.GetY()-me.GetY(),
		)

		distanceToNearest := math.Hypot(
			nearest.GetX()-me.GetX(),
			nearest.GetY()-me.GetY(),
		)

		if distanceToCurrent < distanceToNearest {
			nearest = current
		}
	}

	return nearest
}

const angleFactor = 40.5845104884 // 255/(2*PI)

// TurnAngleToTarget calculates new angle when turning towards target.
func TurnAngleToTarget(thisAngle, dx, dy float64) float64 {
	targetAngle := math.Mod(math.Atan2(dy, dx)*angleFactor, 255)
	normalizedAngle := math.Mod(math.Mod(thisAngle, 255)+255, 255)
	angleDiff := targetAngle - normalizedAngle

	if angleDiff > 127.5 {
		angleDiff -= 255
	} else if angleDiff < -127.5 {
		angleDiff += 255
	}

	return math.Mod(normalizedAngle+angleDiff*0.1+255, 255)
}

const mobDetectionRange = 25.

func getDetectionRange(m *Mob) float64 {
	return mobDetectionRange * m.Size
}

func getLoseRange(m *Mob) float64 {
	return (mobDetectionRange * 2) * m.Size
}

func getTargetNodes(wp *WavePool, m *Mob) []collision.Node {
	var targets []collision.Node

	if m.PetMaster != nil {
		mobs := wp.SafeGetMobsWithCondition(func(fm *Mob) bool {
			return fm.Id != m.Id && fm.PetMaster != nil
		})

		targets = make([]collision.Node, len(mobs))
		for i, mob := range mobs {
			targets[i] = mob
		}
	} else {
		players := wp.SafeGetPlayersWithCondition(func(p *Player) bool {
			return !p.IsDead
		})

		targets = make([]collision.Node, len(players))
		for i, player := range players {
			targets[i] = player
		}
	}

	return targets
}

func (m *Mob) MobAggressivePursuit(wp *WavePool) {
	// If body, dont do anything
	if isBody(wp, m) {
		return
	}

	// Dont do anything while p.StarfishRegeningHealth so
	// can handle angle in mob_health_regen.go
	if m.StarfishRegeningHealth {
		return
	}

	// Target entity dead, stop target
	if m.TargetEntity != nil && IsDeadNode(wp, m.TargetEntity) {
		m.TargetEntity = nil
	}

	// Last attacked entity dead, stop target
	if m.LastAttackedEntity != nil && IsDeadNode(wp, m.LastAttackedEntity) {
		m.LastAttackedEntity = nil
	}

	distanceToTarget := 0.
	if m.TargetEntity != nil {
		dx := m.TargetEntity.GetX() - m.X
		dy := m.TargetEntity.GetY() - m.Y

		distanceToTarget = math.Hypot(dx, dy)
	}

	// Lose entity
	if distanceToTarget > getLoseRange(m) {
		m.TargetEntity = nil
	}

	switch native.EachMobBehaviorDefinition[m.Type] {
	case native.NoneBehavior:
		return

	case native.AggressiveBehavior:
		{
			var targetEntity collision.Node
			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else {
				targetEntity = findNearestEntity(m, getTargetNodes(wp, m))
			}

			if targetEntity == nil {
				return
			}

			dx := targetEntity.GetX() - m.X
			dy := targetEntity.GetY() - m.Y
			distance := math.Hypot(dx, dy)

			if getDetectionRange(m) > distance {
				m.Angle = TurnAngleToTarget(
					m.Angle,
					dx,
					dy,
				)

				m.Magnitude = m.Speed() * 255

				m.TargetEntity = targetEntity
			} else {
				m.TargetEntity = nil
			}
		}

	case native.CautionBehavior:
		{
			var targetEntity collision.Node
			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else {
				targetEntity = findNearestEntity(m, getTargetNodes(wp, m))
			}

			if targetEntity == nil {
				return
			}

			dx := targetEntity.GetX() - m.X
			dy := targetEntity.GetY() - m.Y
			distance := math.Hypot(dx, dy)

			if getDetectionRange(m) > distance {
				m.Angle = TurnAngleToTarget(
					m.Angle,
					dx,
					dy,
				)

				var magnitude float64
				if m.TargetEntity != nil && (3*m.Size) > distanceToTarget {
					magnitude = 0
				} else {
					magnitude = m.Speed()
				}

				m.Magnitude = magnitude * 255

				m.TargetEntity = targetEntity
			} else {
				m.TargetEntity = nil
			}
		}

	case native.PassiveBehavior:
		{
			m.Magnitude = 0
		}

	case native.NeutralBehavior:
		{
			if m.LastAttackedEntity != nil {
				dx := m.LastAttackedEntity.GetX() - m.X
				dy := m.LastAttackedEntity.GetY() - m.Y

				m.Angle = TurnAngleToTarget(
					m.Angle,
					dx,
					dy,
				)

				m.Magnitude = m.Speed() * 255

				m.TargetEntity = m.LastAttackedEntity
			} else {
				m.TargetEntity = nil
			}
		}
	}
}
