package game

import (
	"math"
	"slices"

	"flooooio/internal/native"
)

const movementDuration = 1. / 150.

func (m *Mob) MobSpecialMovement(wp *WavePool) {
	// Dont special movement when passive
	if native.EachMobBehaviorDefinition[m.Type] == native.PassiveBehavior {
		return
	}

	// If projectile mob, dont do anything
	if slices.Contains(ProjectileMobTypes, m.Type) {
		return
	}

	// If body, dont do anything
	if IsBody(wp, m) {
		return
	}

	if m.PetMaster != nil && m.TargetEntity == nil {
		switch m.Type {
		// Follows the player when the player moves away from this (pet) for a certain distance
		// Dont follows if targetting other mob
		case native.MobTypeBeetle:
			{
				dx := m.PetMaster.X - m.X
				dy := m.PetMaster.Y - m.Y
				distanceToParent := math.Hypot(dx, dy)

				if distanceToParent > m.Radius()*5 {
					m.Angle = TurnAngleToTarget(
						m.Angle,
						dx,
						dy,
					)

					m.Magnitude = Speed(m.Type) * 255

					m.PetGoingToMaster = true
				} else {
					m.PetGoingToMaster = false
				}
			}
		}
	} else {
		m.PetGoingToMaster = false
	}

	if m.PetGoingToMaster {
		return
	}

	if m.Type == native.MobTypeHornet && m.TargetEntity != nil {
		return
	}

	if m.ShouldShakeAngle() {
		shakeMultiplier := 1.
		if m.TargetEntity != nil {
			shakeMultiplier = 2.
		}

		m.Angle += SinusodialWave.At(m.SineWaveIndex) * shakeMultiplier
		m.SineWaveIndex++
	}

	if m.TargetEntity == nil {
		if m.RotationCounter >= 500 {
			m.Angle = RandomAngle()

			m.RotationCounter = 0
		}

		m.RotationCounter++

		if m.IsSpecialMoving {
			if m.SpecialMovementTimer >= 1 {
				m.Magnitude = 0

				m.IsSpecialMoving = false
			} else {
				m.Magnitude = math.Sin(m.SpecialMovementTimer * math.Pi) * (Speed(m.Type) * 255)

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

func (m *Mob) ShouldShakeAngle() bool {
	return m.Type == native.MobTypeBee || m.Type == native.MobTypeHornet
}
