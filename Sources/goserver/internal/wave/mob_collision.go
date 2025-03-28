package wave

import "flooooio/internal/native"

func (m *Mob) MobCollision(wp *WavePool) {
	profile0 := native.MobProfiles[m.Type]

	collision0 := profile0.Collision

	mMaxHealth := m.CalculateMaxHealth()
	mDamage := native.DamageOfStat(profile0.StatFromRarity(m.Rarity))

	c0 := circle{m.X, m.Y, m.GetDesiredSize()}

	searchRadius := calculateSearchRadius(collision0, m.Size)

	nearby := wp.SpatialHash.Search(m.X, m.Y, searchRadius)

	for _, ni := range nearby {
		switch nearEntity := ni.(type) {
		// Mob -> Mob
		case *Mob:
			{
				if nearEntity.Id == m.Id {
					continue
				}

				c1 := circle{nearEntity.X, nearEntity.Y, nearEntity.GetDesiredSize()}

				px, py, ok := computeCirclePush(c0, c1)
				if ok {
					m.X -= px * 0.3
					m.Y -= py * 0.3

					nearEntity.X += px * 0.3
					nearEntity.Y += py * 0.3

					{ // Damage
						profile1 := native.MobProfiles[nearEntity.Type]

						nearEntityMaxHealth := nearEntity.CalculateMaxHealth()
						nearEntityDamage := native.DamageOfStat(profile1.StatFromRarity(nearEntity.Rarity))

						m.Health -= nearEntityDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						// TODO: implement lastAttackedEntity set, see EntityCollision
					}
				}
			}

		case *Petal:
			{
				if nearEntity.Id == m.Id {
					continue
				}

				// Pet doesnt damaged/knockbacked to petal
				if m.PetMaster != nil {
					continue
				}

				c1 := circle{nearEntity.X, nearEntity.Y, nearEntity.GetDesiredSize()}

				px, py, ok := computeCirclePush(c0, c1)
				if ok {
					m.X -= px * 0.1
					m.Y -= py * 0.1

					// Maybe dont collide to petal?
					nearEntity.X += px * 3
					nearEntity.Y += py * 3

					{ // Damage
						profile1 := native.MobProfiles[nearEntity.Type]

						nearEntityMaxHealth := nearEntity.CalculateMaxHealth()
						nearEntityDamage := native.DamageOfStat(profile1.StatFromRarity(nearEntity.Rarity))

						m.Health -= nearEntityDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						// TODO: implement lastAttackedEntity set, see EntityCollision
					}
				}
			}

		case *Player:
			{
				if nearEntity.Id == m.Id {
					continue
				}

				// Dont collide to dead/uncollidable player
				if nearEntity.IsDead || !nearEntity.IsCollidable() {
					continue
				}

				// Dont damage/knockback to player
				if m.PetMaster != nil {
					continue
				}

				c1 := circle{nearEntity.X, nearEntity.Y, nearEntity.Size}

				px, py, ok := computeCirclePush(c0, c1)
				if ok {
					m.X -= px
					m.Y -= py

					nearEntity.X += px * 5
					nearEntity.Y += py * 5

					{ // Damage
						nearEntityMaxHealth := nearEntity.CalculateMaxHealth()

						m.Health -= nearEntity.BodyDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						// TODO: implement lastAttackedEntity set, see EntityCollision
					}
				}
			}
		}
	}
}
