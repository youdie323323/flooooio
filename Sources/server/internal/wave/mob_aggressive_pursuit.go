package wave

import (
	"math/rand/v2"
	"slices"
	"time"

	"flooooio/internal/collision"
	"flooooio/internal/native"

	"github.com/chewxy/math32"
)

const (
	jellyfishLightningShootMS = 1000

	hornetMissileShootMS = 2000
)

const (
	hornetCautionRadius    = 5
	jellyfishCautionRadius = 3
)

type JudgementFunc = func(m *Mob, distanceToTarget float32) bool

func createCautionJudger(radiusMultiplier float32) JudgementFunc {
	return func(m *Mob, distanceToTarget float32) bool {
		return m.TargetEntity != nil && (m.CalculateRadius()*radiusMultiplier) > distanceToTarget
	}
}

var cautionBehaviorStopJudger = map[native.MobType]JudgementFunc{
	native.MobTypeHornet:    createCautionJudger(hornetCautionRadius),
	native.MobTypeJellyfish: createCautionJudger(jellyfishCautionRadius),
}

// FindNearestEntity finds the nearest entity from a slice of entities.
func FindNearestEntity(me collision.Node, entities []collision.Node) collision.Node {
	if len(entities) == 0 {
		return nil
	}

	meX := me.GetX()
	meY := me.GetY()

	nearest := entities[0]
	for _, current := range entities[1:] {
		distanceToCurrent := math32.Hypot(
			current.GetX()-meX,
			current.GetY()-meY,
		)

		distanceToNearest := math32.Hypot(
			nearest.GetX()-meX,
			nearest.GetY()-meY,
		)

		if distanceToCurrent < distanceToNearest {
			nearest = current
		}
	}

	return nearest
}

func FindNearestEntityWithLimitedDistance(me collision.Node, entities []collision.Node, maxDistance float32) collision.Node {
	if len(entities) == 0 {
		return nil
	}

	meX := me.GetX()
	meY := me.GetY()

	var nearest collision.Node
	nearestDistance := maxDistance

	for _, current := range entities {
		distanceToCurrent := math32.Hypot(
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

const angleFactor = 255 / Tau // 255/(2*PI)

const angleInterpolationFactor = .05

// TurnAngleToTarget calculates interpolated angle to target.
func TurnAngleToTarget(thisAngle, dx, dy float32) float32 {
	targetAngle := math32.Mod(math32.Atan2(dy, dx)*angleFactor, 255)
	normalizedAngle := math32.Mod(math32.Mod(thisAngle, 255)+255, 255)
	angleDiff := targetAngle - normalizedAngle

	if angleDiff > 127.5 {
		angleDiff -= 255
	} else if angleDiff < -127.5 {
		angleDiff += 255
	}

	return math32.Mod(normalizedAngle+angleDiff*angleInterpolationFactor+255, 255)
}

func normalizeAngle(angle float32) float32 {
	angle = math32.Mod(angle, Tau)

	if angle > math32.Pi {
		angle -= Tau
	} else if angle < -math32.Pi {
		angle += Tau
	}

	return angle
}

func generalPurposePredictInterception(dx, dy, vtx, vty, currentAngle float32) *float32 {
	targetAngle := math32.Atan2(dy, dx)
	currentRad := currentAngle / angleFactor
	angleDiff := math32.Abs(normalizeAngle(targetAngle - currentRad))

	var interpolationTime float32 = 2 /* - log(0.01) */ / angleInterpolationFactor
	if angleDiff > 1e-3 {
		interpolationTime *= (1 - math32.Exp(-angleInterpolationFactor*angleDiff))
	}

	relSpeedSq := missileSpeed*missileSpeed - (vtx*vtx + vty*vty)
	posSq := dx*dx + dy*dy
	dotProd := dx*vtx + dy*vty

	d := dotProd*dotProd + relSpeedSq*posSq
	if d < 0 {
		return nil
	}

	t := (dotProd + math32.Sqrt(d)) / relSpeedSq
	if t < 0 {
		return nil
	}

	// Predict final position using average velocity
	totalTime := t + interpolationTime
	xf := dx + vtx*totalTime
	yf := dy + vty*totalTime

	interpolatedAngle := TurnAngleToTarget(currentAngle, xf, yf)

	return &interpolatedAngle
}

// predictInterceptionAngleMob calculates the angle to hit a moving mob with a missile.
func predictInterceptionAngleMob(dx, dy float32, m *Mob, currentAngle float32) *float32 {
	// Calculate target's speed vector
	targetRad := angleToRadian(m.Angle)

	targetSpeed := m.Magnitude / 255

	vtx := math32.Cos(targetRad) * targetSpeed
	vty := math32.Sin(targetRad) * targetSpeed

	return generalPurposePredictInterception(dx, dy, vtx, vty, currentAngle)
}

// predictInterceptionAnglePlayer calculates the angle to hit a player target with a missile.
// Player movement uses velocity with friction instead of direct angle-based movement.
func predictInterceptionAnglePlayer(dx, dy float32, p *Player, currentAngle float32) *float32 {
	vtx := p.Velocity[0] + p.Accel[0]
	vty := p.Velocity[1] + p.Accel[1]

	return generalPurposePredictInterception(dx, dy, vtx, vty, currentAngle)
}

const mobDetectionRange = 15.

func (m *Mob) calculateDetectRange() float32 {
	return mobDetectionRange * m.CalculateRadius()
}

func (m *Mob) calculateLoseRange() float32 {
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

	var distanceToTarget float32 = 0.

	if m.TargetEntity != nil {
		dx := m.TargetEntity.GetX() - m.X
		dy := m.TargetEntity.GetY() - m.Y

		distanceToTarget = math32.Hypot(dx, dy)
	}

	var isStop bool = false

	judgementFunc, ok := cautionBehaviorStopJudger[m.Type]
	if ok {
		isStop = judgementFunc(m, distanceToTarget)
	}

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

			shootX := m.X + math32.Cos(angleRad)*mRadius
			shootY := m.Y + math32.Sin(angleRad)*mRadius

			dx := m.TargetEntity.GetX() - shootX
			dy := m.TargetEntity.GetY() - shootY
			distance := math32.Hypot(dx, dy)

			// If distance is close, we can just use TurnAngleToTarget
			if distance <= mRadius {
				m.Angle = TurnAngleToTarget(m.Angle, dx, dy)
			} else {
				var predicted *float32 = nil

				switch e := m.TargetEntity.(type) {
				case *Mob:
					{
						predicted = predictInterceptionAngleMob(dx, dy, e, m.Angle)
					}

				case *Player:
					{
						predicted = predictInterceptionAnglePlayer(dx, dy, e, m.Angle)
					}
				}

				if predicted != nil {
					m.Angle = *predicted
				} else {
					m.Angle = TurnAngleToTarget(m.Angle, dx, dy)
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
	if distanceToTarget > m.calculateLoseRange() {
		m.TargetEntity = nil
	}

	switch native.EachMobBehaviorDefinition[m.Type] {
	case native.VoidBehavior:
		return

	case native.ChaoticBehavior:
		{
			m.Angle = math32.Mod(m.Angle+generateValleyDistribution(-25, 25), 255)

			m.Magnitude = SpeedOf(m.Type) * 255 * (1. + (15.-1.)*math32.Pow(rand.Float32(), 2))
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
			distance := math32.Hypot(dx, dy)

			if m.calculateDetectRange() > distance {
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
			distance := math32.Hypot(dx, dy)

			if m.calculateDetectRange() > distance {
				if shouldTurnToTarget {
					m.Angle = TurnAngleToTarget(
						m.Angle,
						dx,
						dy,
					)
				}

				var magnitude float32
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

func generateValleyDistribution(min, max float32) float32 {
	for {
		x := min + rand.Float32()*(max-min)

		probability := math32.Abs(x) / max

		if rand.Float32() < probability {
			return x
		}
	}
}
