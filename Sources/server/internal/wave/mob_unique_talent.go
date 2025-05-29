package wave

import (
	"time"

	"flooooio/internal/native"

	"github.com/chewxy/math32"
)

const movementDuration = 1. / 150.

func (m *Mob) MobUniqueTalent(wp *WavePool, now time.Time) {
	// Dont special movement when passive
	if native.EachMobBehaviorDefinition[m.Type][m.Rarity] == native.PassiveBehavior {
		return
	}

	// If projectile mob, dont do anything
	if m.IsProjectile() {
		return
	}

	// If body, dont do anything
	if IsBody(wp, m) {
		return
	}

	switch m.Type {
	// Follows the player when the player moves away from this (pet) for a certain distance
	// Dont follows if targetting other mob
	case native.MobTypeBeetle:
		{
			if !m.IsEnemy() && m.TargetEntity == nil {
				dx := m.PetMaster.X - m.X
				dy := m.PetMaster.Y - m.Y
				distanceToParent := math32.Hypot(dx, dy)

				if distanceToParent > m.CalculateRadius()*5 {
					m.Angle = CalculateInterpolatedAngleToTarget(
						m.Angle,
						dx,
						dy,
					)

					m.Magnitude = SpeedOf(m.Type) * 255

					m.PetGoingToMaster = true
				} else {
					m.PetGoingToMaster = false
				}
			} else {
				m.PetGoingToMaster = false
			}

			if m.PetGoingToMaster {
				return
			}
		}

	// Shake angle
	case native.MobTypeBee, native.MobTypeHornet:
		{
			if m.Type == native.MobTypeHornet && m.TargetEntity != nil {
				return
			}

			if m.ShouldShakeAngle() {
				var shakeMultiplier float32 = 1.

				if m.TargetEntity != nil {
					shakeMultiplier = 2.
				}

				m.Angle += BeeSinusoidalWave.At(m.SineWaveIndex) * shakeMultiplier
				m.SineWaveIndex++
			}

			if m.TargetEntity == nil {
				if m.RotationCounter >= 500 {
					m.Angle = GetRandomAngle()

					m.RotationCounter = 0
				}

				m.RotationCounter++

				if m.IsSpecialMoving {
					if m.SpecialMovementTimer >= 1 {
						m.Magnitude = 0

						m.IsSpecialMoving = false
					} else {
						m.Magnitude = math32.Sin(m.SpecialMovementTimer*math32.Pi) * (SpeedOf(m.Type) * 255)

						m.SpecialMovementTimer += movementDuration
					}
				} else {
					m.IsSpecialMoving = true
					m.SpecialMovementTimer = 0
				}
			} else {
				m.IsSpecialMoving = false
			}
		}

	case native.MobTypeSpider:
		{
			if m.Rarity >= native.RarityLegendary && m.SigmaT > 1 {
				wp.GenerateMob(
					native.MobTypeWebProjectile,

					m.Rarity,

					m.X,
					m.Y,

					nil,

					nil,
					false,

					nil,
				)

				// TODO: this implementation is not safe and cant used by other location
				m.SigmaT = 0
			}
		}

	// Health regen
	case native.MobTypeStarfish:
		{
			// Regen for starfish
			if m.StarfishRegeningHealth || 0.5 >= m.Health {
				m.StarfishRegeningHealth = true

				maxHealth := m.GetMaxHealth()

				healAmount := float32(m.Rarity) / maxHealth

				m.Health = min(1, m.Health+healAmount)
				if m.Health >= 1 {
					m.StarfishRegeningHealth = false

					return
				}

				if m.TargetEntity != nil {
					dx := m.TargetEntity.GetX() - m.X
					dy := m.TargetEntity.GetY() - m.Y

					m.Angle = CalculateInterpolatedAngleToTarget(
						m.Angle,
						// Reverse angle
						-dx,
						-dy,
					)

					m.Magnitude = SpeedOf(m.Type) * 255
				}
			}
		}
	}
}

func (m *Mob) ShouldShakeAngle() bool {
	return m.Type == native.MobTypeBee || m.Type == native.MobTypeHornet
}
