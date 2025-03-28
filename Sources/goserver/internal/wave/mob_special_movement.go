package wave

import (
	"math"

	"flooooio/internal/native"
)

const movementDuration = 1. / 200.

func (m *Mob) MobSpecialMovement(wp *WavePool) {
	// Dont special movement when passive
	if native.EachMobBehaviorDefinition[m.Type] == native.PassiveBehavior {
		return
	}

	// If body, dont do anything
	if isBody(wp, m) {
		return
	}

	// Follows the player when the player moves away from this (pet) for a certain distance
	// Dont follows if targetting other mob
	if m.PetMaster != nil && m.TargetEntity == nil {
		dx := m.PetMaster.X - m.X
		dy := m.PetMaster.Y - m.Y
		distanceToParent := math.Hypot(dx, dy)

		if distanceToParent > m.Size*2 {
			m.Angle = TurnAngleToTarget(
				m.Angle,
				dx,
				dy,
			)

			m.Magnitude = m.Speed() * 255

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

	if m.ShouldShakeAngle() {
		shakeMultiplier := .5
		if m.TargetEntity != nil {
			shakeMultiplier = 2
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
				m.Magnitude = (m.SpecialMovementTimer * m.Speed()) * 255
				
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
