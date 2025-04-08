package wave

import (
	"math"
	"math/rand/v2"
	"time"

	"flooooio/internal/native"
)

const (
	jellyfishLightningShootMS = 1000
)

// FindNearestEntity finds the nearest entity from a slice of entities.
func FindNearestEntity(me Node, entities []Node) Node {
	if len(entities) == 0 {
		return nil
	}

	// TODO: this should be nil
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

func FindNearestEntityWithLimitedDistance(me Node, entities []Node, maxDistance float64) Node {
	if len(entities) == 0 {
		return nil
	}

	var nearest Node
	nearestDistance := maxDistance

	for _, current := range entities {
		distanceToCurrent := math.Hypot(
			current.GetX()-me.GetX(),
			current.GetY()-me.GetY(),
		)

		if distanceToCurrent <= maxDistance && (nearest == nil || distanceToCurrent < nearestDistance) {
			nearest = current
			nearestDistance = distanceToCurrent
		}
	}

	return nearest
}

const angleFactor = 40.5845104884 // 255/(2*PI)

// TurnAngleToTarget calculates interpolated angle to target.
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

const mobDetectionRange = 15.

func getDetectionRange(m *Mob) float64 {
	return mobDetectionRange * m.DesiredSize()
}

func getLoseRange(m *Mob) float64 {
	return (mobDetectionRange * 2) * m.DesiredSize()
}

func getTargetNodes(wp *WavePool, m *Mob) []Node {
	var targets []Node

	if m.PetMaster != nil {
		mobs := wp.GetMobsWithCondition(func(fm *Mob) bool {
			return fm.Id != m.Id && fm.PetMaster == nil
		})

		targets = make([]Node, len(mobs))
		for i, mob := range mobs {
			targets[i] = mob
		}
	} else {
		players := wp.GetPlayersWithCondition(func(p *Player) bool {
			return !p.IsDead
		})

		targets = make([]Node, len(players))
		for i, player := range players {
			targets[i] = player
		}
	}

	return targets
}

func (m *Mob) MobAggressivePursuit(wp *WavePool) {
	// If body, dont do anything
	if IsBody(wp, m) {
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
			var targetEntity Node
			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else {
				targetEntity = FindNearestEntity(m, getTargetNodes(wp, m))
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
			var targetEntity Node
			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else {
				targetEntity = FindNearestEntity(m, getTargetNodes(wp, m))
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

				shouldStop := m.TargetEntity != nil && (3*m.Size) > distanceToTarget

				m.TargetEntity = targetEntity

				var magnitude float64
				if shouldStop {
					magnitude = 0
				} else {
					magnitude = m.Speed() * 255
				}

				m.Magnitude = magnitude

				switch v := targetEntity.(type) {
				case *Player:
					{
						// Specials
						switch m.Type {
						// Do lightning bounce to player
						case native.MobTypeJellyfish:
							{
								if shouldStop {
									now := time.Now()

									if now.Sub(m.JellyfishLastBounce) >= jellyfishLightningShootMS*time.Millisecond {
										wp.MobDoLightningBounce(m, v)

										m.JellyfishLastBounce = now
									}
								}
							}
						}
					}
				}
			} else {
				m.TargetEntity = nil
			}
		}

	case native.ChaoticBehavior:
		{
			m.Angle = math.Mod(m.Angle+generateValleyDistribution(-25, 25), 255)

			m.Magnitude = m.Speed() * 255 * (1. + (15.-1.)*math.Pow(rand.Float64(), 2))
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

func generateValleyDistribution(min, max float64) float64 {
	for {
		x := min + rand.Float64()*(max-min)

		probability := math.Abs(x) / max

		if rand.Float64() < probability {
			return x
		}
	}
}
