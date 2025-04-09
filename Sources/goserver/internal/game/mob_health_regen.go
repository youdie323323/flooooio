package game

import "flooooio/internal/native"

func (m *Mob) MobHealthRegen(wp *WavePool) {
	// Regen for starfish
	if m.StarfishRegeningHealth || (m.Type == native.MobTypeStarfish && 0.5 >= m.Health) {
		m.StarfishRegeningHealth = true

		maxHealth := m.MaxHealth()

		healAmount := (3 * m.Size) / maxHealth

		m.Health = min(1, m.Health+healAmount)
		if m.Health >= 1 {
			m.StarfishRegeningHealth = false

			return
		}

		if m.TargetEntity != nil {
			dx := m.TargetEntity.GetX() - m.X
			dy := m.TargetEntity.GetY() - m.Y

			m.Angle = TurnAngleToTarget(
				m.Angle,
				// Reverse angle
				-dx,
				-dy,
			)

			m.Magnitude = Speed(m.Type) * 255
		}
	}
}
