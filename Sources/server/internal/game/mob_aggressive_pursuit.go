package game

import (
	"math"
	"math/rand/v2"
	"slices"
	"time"

	"flooooio/internal/native"
	"flooooio/internal/collision"
)

const (
	jellyfishLightningShootMS = 1000

	hornetMissileShootMS = 2000
)

// FindNearestEntity finds the nearest entity from a slice of entities.
func FindNearestEntity(me collision.Node, entities []collision.Node) collision.Node {
	if len(entities) == 0 {
		return nil
	}

	meX := me.GetX()
	meY := me.GetY()

	// TODO: this should be nil
	nearest := entities[0]
	for _, current := range entities[1:] {
		distanceToCurrent := math.Hypot(
			current.GetX()-meX,
			current.GetY()-meY,
		)

		distanceToNearest := math.Hypot(
			nearest.GetX()-meX,
			nearest.GetY()-meY,
		)

		if distanceToCurrent < distanceToNearest {
			nearest = current
		}
	}

	return nearest
}

func FindNearestEntityWithLimitedDistance(me collision.Node, entities []collision.Node, maxDistance float64) collision.Node {
	if len(entities) == 0 {
		return nil
	}

	meX := me.GetX()
	meY := me.GetY()

	var nearest collision.Node
	nearestDistance := maxDistance

	for _, current := range entities {
		distanceToCurrent := math.Hypot(
			current.GetX()-meX,
			current.GetY()-meY,
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

// predictInterceptionAngle calculates the angle to hit a moving target with a missile.
func predictInterceptionAngle(dx, dy float64, target collision.Node, missileSpeed float64) *float64 {
	// Get target speed vector (Magnitude/255 * cos/sin(Angle))
	targetRad := angleToRadian(target.GetAngle())
	targetSpeed := target.GetMagnitude() / 255

	targetVx := math.Cos(targetRad) * targetSpeed
	targetVy := math.Sin(targetRad) * targetSpeed

	// Calculate collision time by solving quadratic equation
	// (missileSpeed^2 - targetSpeed^2)t^2
	// - 2(dx*targetVx + dy*targetVy)t
	// - (dx^2 + dy^2) = 0
	a := missileSpeed*missileSpeed - targetSpeed*targetSpeed
	b := -2 * (dx*targetVx + dy*targetVy)
	c := -(dx*dx + dy*dy)

	d := b*b - 4*a*c
	if d < 0 {
		// No valid solution

		return nil
	}

	rootd := math.Sqrt(d)

	// Use the smallest positive solution
	t1 := (-b + rootd) / (2 * a)
	t2 := (-b - rootd) / (2 * a)
	t := math.Min(t1, t2)

	if t < 0 {
		t = math.Max(t1, t2)
	}

	if t < 0 {
		// No valid solution

		return nil
	}

	// Calculate predicted location
	futureX := dx + targetVx*t
	futureY := dy + targetVy*t

	// Convert to 255 scale angle
	angle := math.Mod(math.Atan2(futureY, futureX)*angleFactor, 255)

	return &angle
}

const mobDetectionRange = 15.

func (m *Mob) detectRange() float64 {
	return mobDetectionRange * m.CalculateRadius()
}

func (m *Mob) loseRange() float64 {
	return (mobDetectionRange * 2) * m.CalculateRadius()
}

// GetTrackingTargets returns target nodes to track.
func (m *Mob) GetTrackingTargets(wp *WavePool) []collision.Node {
	var targets []collision.Node

	if !m.IsEnemy() {
		mobs := wp.GetMobsWithCondition(func(fm *Mob) bool {
			return fm.Id != m.Id && fm.PetMaster == nil && !slices.Contains(ProjectileMobTypes, fm.Type)
		})

		targets = make([]collision.Node, len(mobs))
		for i, mob := range mobs {
			targets[i] = mob
		}
	} else {
		players := wp.GetPlayersWithCondition(func(p *Player) bool {
			return !p.IsDead
		})

		targets = make([]collision.Node, len(players))
		for i, player := range players {
			targets[i] = player
		}
	}

	return targets
}

var missileSpeed = SpeedOf(native.MobTypeMissile)

func (m *Mob) MobAggressivePursuit(wp *WavePool) {
	// If body, dont do anything
	if IsBody(wp, m) {
		return
	}

	// If projectile mob, dont do anything
	if slices.Contains(ProjectileMobTypes, m.Type) {
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

	isStop := m.TargetEntity != nil && (m.CalculateRadius()*5) > distanceToTarget

	shouldTurnToTarget := true

	// Mob specials
	switch m.Type {
	// Do lightning bounce to target
	case native.MobTypeJellyfish:
		{
			if isStop {
				now := time.Now()

				if now.Sub(m.JellyfishLastBounce) >= jellyfishLightningShootMS*time.Millisecond {
					// TODO: this only shoot to player, make it shoot able to mob & player
					wp.MobDoLightningBounce(m, m.TargetEntity)

					m.JellyfishLastBounce = now
				}
			}
		}

	// Shoot missile to target
	case native.MobTypeHornet:
		{
			if m.TargetEntity == nil {
				break
			}

			shouldTurnToTarget = false

			angleRad := angleToRadian(m.Angle)

			mRadius := m.CalculateRadius()

			shootX := m.X + math.Cos(angleRad)*mRadius
			shootY := m.Y + math.Sin(angleRad)*mRadius

			dx := m.TargetEntity.GetX() - shootX
			dy := m.TargetEntity.GetY() - shootY
			distance := math.Hypot(dx, dy)

			// If distance is close, we can just use TurnAngleToTarget
			if distance <= mRadius {
				m.Angle = TurnAngleToTarget(m.Angle, dx, dy)
			} else {
				predicted := predictInterceptionAngle(dx, dy, m.TargetEntity, missileSpeed)
				if predicted == nil {
					m.Angle = TurnAngleToTarget(m.Angle, dx, dy)
				} else {
					m.Angle = *predicted
				}
			}

			now := time.Now()

			if now.Sub(m.HornetLastMissileShoot) >= hornetMissileShootMS*time.Millisecond {
				missile := wp.GenerateMob(
					native.MobTypeMissile,

					m.Rarity,

					shootX,
					shootY,

					nil,

					nil,
					false,

					m,
				)

				missile.Magnitude = SpeedOf(missile.Type) * 255
				missile.Angle = m.Angle

				m.HornetLastMissileShoot = now
			}
		}
	}

	// Lose target
	if distanceToTarget > m.loseRange() {
		m.TargetEntity = nil
	}

	switch native.EachMobBehaviorDefinition[m.Type] {
	case native.VoidBehavior:
		return

	case native.ChaoticBehavior:
		{
			m.Angle = math.Mod(m.Angle+generateValleyDistribution(-25, 25), 255)

			m.Magnitude = SpeedOf(m.Type) * 255 * (1. + (15.-1.)*math.Pow(rand.Float64(), 2))
		}

	case native.PassiveBehavior:
		{
			m.Magnitude = 0
		}

	case native.AggressiveBehavior:
		{
			var targetEntity collision.Node
			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else {
				targetEntity = FindNearestEntity(m, m.GetTrackingTargets(wp))
			}

			if targetEntity == nil {
				return
			}

			dx := targetEntity.GetX() - m.X
			dy := targetEntity.GetY() - m.Y
			distance := math.Hypot(dx, dy)

			if m.detectRange() > distance {
				if shouldTurnToTarget {
					m.Angle = TurnAngleToTarget(
						m.Angle,
						dx,
						dy,
					)
				}

				m.Magnitude = SpeedOf(m.Type) * 255

				m.TargetEntity = targetEntity
			}
		}

	case native.CautionBehavior:
		{
			var targetEntity collision.Node
			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else {
				targetEntity = FindNearestEntity(m, m.GetTrackingTargets(wp))
			}

			if targetEntity == nil {
				return
			}

			dx := targetEntity.GetX() - m.X
			dy := targetEntity.GetY() - m.Y
			distance := math.Hypot(dx, dy)

			if m.detectRange() > distance {
				if shouldTurnToTarget {
					m.Angle = TurnAngleToTarget(
						m.Angle,
						dx,
						dy,
					)
				}

				var magnitude float64
				if isStop {
					magnitude = 0
				} else {
					magnitude = SpeedOf(m.Type) * 255
				}

				m.Magnitude = magnitude

				m.TargetEntity = targetEntity
			}
		}

	case native.NeutralBehavior:
		{
			if m.LastAttackedEntity != nil {
				dx := m.LastAttackedEntity.GetX() - m.X
				dy := m.LastAttackedEntity.GetY() - m.Y

				if shouldTurnToTarget {
					m.Angle = TurnAngleToTarget(
						m.Angle,
						dx,
						dy,
					)
				}

				m.Magnitude = SpeedOf(m.Type) * 255

				m.TargetEntity = m.LastAttackedEntity
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
