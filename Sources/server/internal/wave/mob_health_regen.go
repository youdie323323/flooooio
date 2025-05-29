package wave

import (
	"flooooio/internal/native"
	"time"
)

func (m *Mob) MobHealthRegen(wp *WavePool, _ time.Time) {
	// Regen for starfish
	if m.StarfishRegeningHealth || (m.Type == native.MobTypeStarfish && 0.5 >= m.Health) {
		m.StarfishRegeningHealth = true

		maxHealth := m.GetMaxHealth()

		healAmount := (3 * m.Size) / maxHealth

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
