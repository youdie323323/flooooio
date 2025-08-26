package wave

import (
	"math/rand/v2"
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
	spatial_hash "github.com/youdie323323/go-spatial-hash"
)

const (
	mobJellyfishLightningShootInterval = 1000 * time.Millisecond

	mobHornetMissileShootInterval = 2000 * time.Millisecond
)

type MobCautionJudger = func(m *Mob, distanceToTargetDot float32) bool

func createMobCautionJudger(radiusMultiplier float32) MobCautionJudger {
	return func(m *Mob, distanceToTargetDot float32) bool {
		cautionRad := radiusMultiplier * m.Radius()

		return m.TargetEntity != nil && cautionRad*cautionRad > distanceToTargetDot
	}
}

const (
	mobHornetCautionRadius    = 5
	mobJellyfishCautionRadius = 3
)

var mobCautionBehaviorStopJudgers = map[native.MobType]MobCautionJudger{
	native.MobTypeHornet:    createMobCautionJudger(mobHornetCautionRadius),
	native.MobTypeJellyfish: createMobCautionJudger(mobJellyfishCautionRadius),
}

// FindNearestEntity finds the nearest entity from a slice of entities.
func FindNearestEntity(me PoolNode, entities PoolNodeSlice) PoolNode {
	if len(entities) == 0 {
		return nil
	}

	meX, meY := me.GetX(),
		me.GetY()

	nearest := entities[0]

	var dx, dy float32
	var distanceSqToCurrent, distanceSqToNearest float32

	for _, current := range entities[1:] {
		dx, dy = current.GetX()-meX,
			current.GetY()-meY

		distanceSqToCurrent = dx*dx + dy*dy

		dx, dy = nearest.GetX()-meX,
			nearest.GetY()-meY

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

	meX, meY := me.GetX(),
		me.GetY()

	var nearest PoolNode

	maxDistanceSq := maxDistance * maxDistance
	nearestDistanceSq := maxDistanceSq

	var dx, dy, dot float32

	for _, current := range entities {
		dx, dy = current.GetX()-meX,
			current.GetY()-meY

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

// IntepolateAngleTo interpolates angle to (Δx, Δy).
func IntepolateAngleTo(thisAngle, dx, dy float32) float32 {
	angleDiff := math32.Mod(angleFactor*math32.Atan2(dy, dx), 255) - thisAngle

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

	switch {
	case angle > math32.Pi:
		angle -= Tau32

	case angle < -math32.Pi:
		angle += Tau32
	}

	return angle
}

var ProjectileMissileSpeed = MobSpeedOf(native.MobTypeMissileProjectile)

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

	relSpeedSq := ProjectileMissileSpeed*ProjectileMissileSpeed - (vtx*vtx + vty*vty)
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

	xf, yf := dx+vtx*totalTime,
		dy+vty*totalTime

	interpolatedAngle := IntepolateAngleTo(currentAngle, xf, yf)

	return &interpolatedAngle
}

// predictInterceptionAngleToMob calculates the angle to hit a moving mob with a missile.
func predictInterceptionAngleToMob(dx, dy float32, m *Mob, currentAngle float32) *float32 {
	// Calculate target's speed vector
	targetRadian := AngleToRadian(m.Angle)

	targetSpeed := m.Magnitude / 255

	vtx := targetSpeed * math32.Cos(targetRadian)
	vty := targetSpeed * math32.Sin(targetRadian)

	return predictInterceptionAngle(dx, dy, vtx, vty, currentAngle)
}

// predictInterceptionAngleToPlayer calculates the angle to hit a player target with a missile.
// Player movement uses velocity instead of angle-based movement.
func predictInterceptionAngleToPlayer(dx, dy float32, p *Player, currentAngle float32) *float32 {
	vtx, vty := p.Velocity[0]+p.Acceleration[0],
		p.Velocity[1]+p.Acceleration[1]

	return predictInterceptionAngle(dx, dy, vtx, vty, currentAngle)
}

// DetectRange returns detection range within this mob.
func (m *Mob) DetectRange() float32 {
	return 2000
}

// TrackingTargets returns target nodes to track.
func (m *Mob) TrackingTargets(wp *Pool) PoolNodeSlice {
	if m.IsEnemy() {
		return spatial_hash.ToNodeSlice(wp.FilterPlayersWithCondition(func(p *Player) bool {
			return !p.IsDead
		}))
	} else {
		return spatial_hash.ToNodeSlice(wp.FilterMobsWithCondition(func(fm *Mob) bool {
			return fm.Id != m.Id && fm.IsOrganismEnemy()
		}))
	}
}

func (m *Mob) MobBehavior(wp *Pool, now time.Time) {
	// If body, dont do anything
	if IsBody(wp, m) {
		return
	}

	// If projectile mob, dont do anything
	if m.IsProjectile() {
		return
	}

	// Dont do anything while p.StarfishRegeningHealth is active, so
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
		judgementFunc, ok := mobCautionBehaviorStopJudgers[m.Type]
		if ok {
			dx, dy := m.TargetEntity.GetX()-m.X,
				m.TargetEntity.GetY()-m.Y

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
				if now.Sub(m.JellyfishLastBounce) >= mobJellyfishLightningShootInterval {
					magnet := FindNearestEntityWithLimitedDistance(
						m.TargetEntity,
						spatial_hash.ToNodeSlice(wp.FilterPetalsWithCondition(func(p *Petal) bool { return p.Type == native.PetalTypeMagnet })),
						orbitAngryMoodRadius,
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

			angleRadian := AngleToRadian(m.Angle)

			mRadius := m.Radius()
			mRadiusSq := mRadius * mRadius

			shootX, shootY := m.X+math32.Cos(angleRadian)*mRadius,
				m.Y+math32.Sin(angleRadian)*mRadius

			dx, dy := m.TargetEntity.GetX()-shootX,
				m.TargetEntity.GetY()-shootY

			// If distance is close, we can just use CalculateInterpolatedAngleToTarget
			if (dx*dx + dy*dy) <= mRadiusSq {
				m.Angle = IntepolateAngleTo(m.Angle, dx, dy)
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
					m.Angle = IntepolateAngleTo(m.Angle, dx, dy)
				}
			}

			if now.Sub(m.HornetLastMissileShoot) >= mobHornetMissileShootInterval {
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

	behavior := native.MobBehaviors[m.Type][m.Rarity]

	switch behavior {
	case native.MobPassiveBehavior:
		return

	case native.MobChaoticBehavior:
		{
			m.Angle = math32.Mod(m.Angle+generateValleyDistribution(-25, 25), 255)

			m.Magnitude = 255 * MobSpeedOf(m.Type)
		}

	case native.MobHostileBehavior:
		{
			var targetEntity PoolNode

			if m.TargetEntity != nil {
				targetEntity = m.TargetEntity
			} else if m.LastAttackedEntity != nil {
				targetEntity = m.LastAttackedEntity
			} else {
				targetEntity = FindNearestEntityWithLimitedDistance(m, m.TrackingTargets(wp), m.DetectRange())
				if targetEntity == nil {
					return
				}
			}

			if shouldTurnToTarget {
				dx, dy := targetEntity.GetX()-m.X,
					targetEntity.GetY()-m.Y

				m.Angle = IntepolateAngleTo(
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

	case native.MobNeutralBehavior:
		{
			if m.LastAttackedEntity != nil {
				if shouldTurnToTarget {
					dx, dy := m.LastAttackedEntity.GetX()-m.X,
						m.LastAttackedEntity.GetY()-m.Y

					m.Angle = IntepolateAngleTo(
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
