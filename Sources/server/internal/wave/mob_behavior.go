package wave

import (
	"math/rand/v2"
	"time"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"

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

type JudgementFunc = func(m *Mob, distanceToTargetDot float32) bool

func createCautionJudger(radiusMultiplier float32) JudgementFunc {
	return func(m *Mob, distanceToTargetDot float32) bool {
		cautionRad := m.Radius() * radiusMultiplier

		return m.TargetEntity != nil && (cautionRad*cautionRad) > distanceToTargetDot
	}
}

var cautionBehaviorStopJudger = map[native.MobType]JudgementFunc{
	native.MobTypeHornet:    createCautionJudger(hornetCautionRadius),
	native.MobTypeJellyfish: createCautionJudger(jellyfishCautionRadius),
}

// FindNearestEntity finds the nearest entity from a slice of entities.
func FindNearestEntity(me PoolNode, entities PoolNodeSlice) PoolNode {
	if len(entities) == 0 {
		return nil
	}

	meX := me.GetX()
	meY := me.GetY()

	nearest := entities[0]

	var dx, dy float32
	var distanceSqToCurrent, distanceSqToNearest float32

	for _, current := range entities[1:] {
		dx = current.GetX() - meX
		dy = current.GetY() - meY

		distanceSqToCurrent = dx*dx + dy*dy

		dx = nearest.GetX() - meX
		dy = nearest.GetY() - meY

		distanceSqToNearest = dx*dx + dy*dy

		if distanceSqToCurrent < distanceSqToNearest {
			nearest = current
		}
	}

	return nearest
}

func FindNearestEntityWithLimitedDistance(me PoolNode, entities PoolNodeSlice, maxDistance float32) PoolNode {
	if len(entities) == 0 {
		return nil
	}

	meX := me.GetX()
	meY := me.GetY()

	var nearest PoolNode

	maxDistanceSq := maxDistance * maxDistance
	nearestDistanceSq := maxDistanceSq

	var dx, dy, dot float32

	for _, current := range entities {
		dx = current.GetX() - meX
		dy = current.GetY() - meY

		dot = dx*dx + dy*dy

		if dot <= maxDistanceSq && (nearest == nil || dot < nearestDistanceSq) {
			nearest = current
			nearestDistanceSq = dot
		}
	}

	return nearest
}

const angleFactor = 255 / Tau32 // 255/2π

const angleInterpolationFactor = .05

// CalculateInterpolatedAngleToEntity calculates interpolated angle to entity.
func CalculateInterpolatedAngleToEntity(thisAngle, dx, dy float32) float32 {
	angleDiff := math32.Mod(math32.Atan2(dy, dx)*angleFactor, 255) - thisAngle

	switch {
	case angleDiff > 127.5:
		angleDiff -= 255

	case angleDiff < -127.5:
		angleDiff += 255
	}

	return math32.Mod(thisAngle+angleDiff*angleInterpolationFactor, 255)
}

func normalizeAngle(angle float32) float32 {
	angle = math32.Mod(angle, Tau32)

	if angle > math32.Pi {
		angle -= Tau32
	} else if angle < -math32.Pi {
		angle += Tau32
	}

	return angle
}

// predictInterceptionAngle predict interception angle to entity.
// vtx, vty is movement vector of entity.
func predictInterceptionAngle(dx, dy, vtx, vty, currentAngle float32) *float32 {
	targetAngle := math32.Atan2(dy, dx)
	currentRad := currentAngle / angleFactor
	angleDiff := math32.Abs(normalizeAngle(targetAngle - currentRad))

	var interpolationTime float32 = 2 /* -log(0.01) */ / angleInterpolationFactor
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

	interpolatedAngle := CalculateInterpolatedAngleToEntity(currentAngle, xf, yf)

	return &interpolatedAngle
}

// predictInterceptionAngleToMob calculates the angle to hit a moving mob with a missile.
func predictInterceptionAngleToMob(dx, dy float32, m *Mob, currentAngle float32) *float32 {
	// Calculate target's speed vector
	targetRad := angleToRadian(m.Angle)

	targetSpeed := m.Magnitude / 255

	vtx := math32.Cos(targetRad) * targetSpeed
	vty := math32.Sin(targetRad) * targetSpeed

	return predictInterceptionAngle(dx, dy, vtx, vty, currentAngle)
}

// predictInterceptionAngleToPlayer calculates the angle to hit a player target with a missile.
// Player movement uses velocity instead of angle-based movement.
func predictInterceptionAngleToPlayer(dx, dy float32, p *Player, currentAngle float32) *float32 {
	vtx := p.Velocity[0] + p.Acceleration[0]
	vty := p.Velocity[1] + p.Acceleration[1]

	return predictInterceptionAngle(dx, dy, vtx, vty, currentAngle)
}

// detectRange returns detection range within this mob.
func (m *Mob) detectRange() float32 {
	return 2000
}

// TrackingTargets returns target nodes to track.
func (m *Mob) TrackingTargets(wp *Pool) PoolNodeSlice {
	if m.IsEnemy() {
		return collision.ToNodeSlice(wp.FilterPlayersWithCondition(func(p *Player) bool {
			return !p.IsDead
		}))
	} else {
		return collision.ToNodeSlice(wp.FilterMobsWithCondition(func(fm *Mob) bool {
			return fm.Id != m.Id && fm.IsEnemy() && !fm.IsProjectile()
		}))
	}
}

var missileSpeed = MobSpeedOf(native.MobTypeMissileProjectile)

func (m *Mob) MobBehavior(wp *Pool, now time.Time) {
	// If body, dont do anything
	if IsBody(wp, m) {
		return
	}

	// If projectile mob, dont do anything
	if m.IsProjectile() {
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

	shouldStop := false

	if m.TargetEntity != nil {
		judgementFunc, ok := cautionBehaviorStopJudger[m.Type]
		if ok {
			dx := m.TargetEntity.GetX() - m.X
			dy := m.TargetEntity.GetY() - m.Y

			shouldStop = judgementFunc(m, dx*dx+dy*dy)
		}
	}

	shouldTurnToTarget := true

	// Mob specials
	switch m.Type {
	// Do lightning bounce to target
	case native.MobTypeJellyfish:
		{
			if shouldStop {
				if now.Sub(m.JellyfishLastBounce) >= jellyfishLightningShootMS*time.Millisecond {
					magnet := FindNearestEntityWithLimitedDistance(
						m.TargetEntity,
						collision.ToNodeSlice(wp.FilterPetalsWithCondition(func(p *Petal) bool { return p.Type == native.PetalTypeMagnet })),
						AngryMoodRadius,
					)

					if magnet != nil {
						wp.MobDoLightningBounce(m, magnet)
					} else {
						wp.MobDoLightningBounce(m, m.TargetEntity)
					}

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

			mRadius := m.Radius()
			mRadiusSq := mRadius * mRadius

			shootX := m.X + math32.Cos(angleRad)*mRadius
			shootY := m.Y + math32.Sin(angleRad)*mRadius

			dx := m.TargetEntity.GetX() - shootX
			dy := m.TargetEntity.GetY() - shootY

			// If distance is close, we can just use CalculateInterpolatedAngleToTarget
			if (dx*dx + dy*dy) <= mRadiusSq {
				m.Angle = CalculateInterpolatedAngleToEntity(m.Angle, dx, dy)
			} else {
				var predicted *float32 = nil

				switch e := m.TargetEntity.(type) {
				case *Mob:
					{
						predicted = predictInterceptionAngleToMob(dx, dy, e, m.Angle)
					}

				case *Player:
					{
						predicted = predictInterceptionAngleToPlayer(dx, dy, e, m.Angle)
					}
				}

				if predicted != nil {
					m.Angle = *predicted
				} else {
					m.Angle = CalculateInterpolatedAngleToEntity(m.Angle, dx, dy)
				}
			}

			if now.Sub(m.HornetLastMissileShoot) >= hornetMissileShootMS*time.Millisecond {
				missile := wp.GenerateMob(
					native.MobTypeMissileProjectile,

					m.Rarity,

					shootX,
					shootY,

					m.PetMaster,

					nil,
					false,
				)

				missile.Magnitude = MobSpeedOf(missile.Type) * 255
				missile.Angle = m.Angle

				m.HornetLastMissileShoot = now
			}
		}
	}

	behavior := native.EachMobBehaviorDefinition[m.Type][m.Rarity]

	switch behavior {
	case native.PassiveBehavior:
		return

	case native.ChaoticBehavior:
		{
			m.Angle = math32.Mod(m.Angle+generateValleyDistribution(-25, 25), 255)

			m.Magnitude = MobSpeedOf(m.Type) * 255
		}

	case native.HostileBehavior:
		{
			var targetEntity PoolNode

			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else if m.LastAttackedEntity != nil {
				targetEntity = m.LastAttackedEntity
			} else {
				targetEntity = FindNearestEntityWithLimitedDistance(m, m.TrackingTargets(wp), m.detectRange())
				if targetEntity == nil {
					return
				}
			}

			if shouldTurnToTarget {
				dx := targetEntity.GetX() - m.X
				dy := targetEntity.GetY() - m.Y

				m.Angle = CalculateInterpolatedAngleToEntity(
					m.Angle,
					dx,
					dy,
				)
			}

			var magnitude float32
			if shouldStop {
				magnitude = 0
			} else {
				magnitude = MobSpeedOf(m.Type) * 255
			}

			m.Magnitude = magnitude

			m.TargetEntity = targetEntity
		}

	case native.NeutralBehavior:
		{
			if m.LastAttackedEntity != nil {
				if shouldTurnToTarget {
					dx := m.LastAttackedEntity.GetX() - m.X
					dy := m.LastAttackedEntity.GetY() - m.Y

					m.Angle = CalculateInterpolatedAngleToEntity(
						m.Angle,
						dx,
						dy,
					)
				}

				m.Magnitude = MobSpeedOf(m.Type) * 255

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
