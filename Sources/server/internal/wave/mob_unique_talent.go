package wave

import (
	"slices"
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

const (
	movementTimerDuration = 150.

	RotationCounterGoal = 500
)

var talentDisabledMobTypes = []native.MobType{
	native.MobTypeShell,
	native.MobTypeBubble,
	native.MobTypeCactus,
	native.MobTypeSponge,
}

const (
	specialMovementDefaultTimer         = 1
	specialMovementCentipedeDesertTimer = 2
)

var beeSinusoidalWave = NewSinusoidalWave(200)

func (m *Mob) MobUniqueTalent(wp *WavePool, now time.Time) {
	if slices.Contains(talentDisabledMobTypes, m.Type) {
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

	if m.TargetEntity == nil {
		if m.RotationCounter >= RotationCounterGoal {
			m.Angle = GetRandomAngle()

			m.RotationCounter = 0
		}

		m.RotationCounter++

		if m.IsSpecialMoving {
			var timer float32

			switch m.Type {
			case native.MobTypeCentipedeDesert:
				timer = specialMovementCentipedeDesertTimer

			default:
				timer = specialMovementDefaultTimer
			}

			if m.MovementTimer >= timer {
				m.Magnitude = 0

				m.IsSpecialMoving = false
			} else {
				switch m.Type {
				case native.MobTypeCentipedeDesert:
					m.Magnitude = SpeedOf(m.Type) * 255
					m.Angle += math32.Sin(math32.Pi*m.MovementTimer) / 2

				default:
					m.Magnitude = math32.Sin(math32.Pi*m.MovementTimer) * (SpeedOf(m.Type) * 255)
				}

				m.MovementTimer += 1. / movementTimerDuration
			}
		} else {
			m.IsSpecialMoving = true
			m.MovementTimer = 0
		}
	} else {
		m.IsSpecialMoving = false
	}

	switch m.Type {
	// Follows the player when the player moves away from this (pet) for a certain distance
	// Dont follows if targetting other mob
	case native.MobTypeBeetle:
		{
			if m.IsAlly() && m.TargetEntity == nil {
				dx := m.PetMaster.X - m.X
				dy := m.PetMaster.Y - m.Y

				dia3 := 3 * m.CalculateDiameter()

				if (dx*dx + dy*dy) > (dia3 * dia3) {
					m.Angle = CalculateInterpolatedAngleToEntity(
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

				m.Angle += beeSinusoidalWave.At(m.SineWaveIndex) * shakeMultiplier
				m.SineWaveIndex++
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

				healAmount := float32(m.Rarity) / (2 * maxHealth)

				m.Health = min(1, m.Health+healAmount)
				if m.Health >= 1 {
					m.StarfishRegeningHealth = false

					return
				}

				if m.TargetEntity != nil {
					dx := m.TargetEntity.GetX() - m.X
					dy := m.TargetEntity.GetY() - m.Y

					m.Angle = CalculateInterpolatedAngleToEntity(
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
