package wave

import "flooooio/internal/native"

const (
	mobToMobPushMultiplier = 0.75
)

func (m *Mob) MobCollision(wp *WavePool) {
	profile0 := native.MobProfiles[m.Type]

	collision0 := profile0.Collision

	mMaxHealth := m.CalculateMaxHealth()
	mDamage := profile0.StatFromRarity(m.Rarity).GetDamage()

	mTraversed := traverseMobSegments(wp, m)

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

				if nearEntity.WasEliminated(wp) {
					return
				}

				c1 := circle{nearEntity.X, nearEntity.Y, nearEntity.GetDesiredSize()}

				px, py, ok := computeCirclePush(c0, c1)
				if ok {
					m.X -= px * mobToMobPushMultiplier
					m.Y -= py * mobToMobPushMultiplier

					nearEntity.X += px * mobToMobPushMultiplier
					nearEntity.Y += py * mobToMobPushMultiplier

					// Mob doesnt damaged to mob
					if m.PetMaster == nil && nearEntity.PetMaster == nil {
						return
					}

					// Pet doesnt damaged to other pet
					if m.PetMaster != nil && nearEntity.PetMaster != nil {
						return
					}

					{ // Damage
						profile1 := native.MobProfiles[nearEntity.Type]

						nearEntityMaxHealth := nearEntity.CalculateMaxHealth()
						nearEntityDamage := profile1.StatFromRarity(nearEntity.Rarity).GetDamage()

						m.Health -= nearEntityDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						{ // Set LastAttackedEntity
							// TODO: this algorithm might collide like: mob1 -> mob2, mob2 -> mob1
							// So maybe its possible to do multiple hit once one frame

							if nearEntity.PetMaster != nil {
								mTraversed.LastAttackedEntity = nearEntity.PetMaster
							}
						}
					}
				}
			}

		case *Petal:
			{
				if nearEntity.Id == m.Id {
					continue
				}

				if nearEntity.WasEliminated(wp) {
					return
				}

				// Petal doesnt damaged/knockbacked to pet
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
						nearEntityDamage := profile1.StatFromRarity(nearEntity.Rarity).GetDamage()

						m.Health -= nearEntityDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						{ // Set LastAttackedEntity
							if nearEntity.Master != nil {
								mTraversed.LastAttackedEntity = nearEntity.Master
							}
						}
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

						{ // Set LastAttackedEntity
							mTraversed.LastAttackedEntity = nearEntity
						}
					}
				}
			}
		}
	}
}
