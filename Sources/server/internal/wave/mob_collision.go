package wave

import (
	"slices"

	"flooooio/internal/collision"
	"flooooio/internal/native"
)

const (
	mobToMobPushMultiplier = 0.5
)

func (m *Mob) MobCollision(wp *WavePool) {
	if m.WasEliminated(wp) {
		return
	}

	profile0 := native.MobProfiles[m.Type]

	collision0 := profile0.Collision

	mMaxHealth := m.GetMaxHealth()
	mDamage := profile0.StatFromRarity(m.Rarity).GetDamage()

	mTraversed := TraverseMobSegments(wp, m)

	mIsProjectile := slices.Contains(ProjectileMobTypes, m.Type)

	mIsEnemyMissile := m.IsEnemyMissile()

	mIsEnemy := m.IsEnemy()

	c0 := collision.Circle{X: m.X, Y: m.Y, R: m.CalculateRadius()}

	searchRadius := CalculateSearchRadius(collision0, m.Size)

	nearby := wp.SpatialHash.Search(m.X, m.Y, searchRadius)

	nearby.Range(func(_ uint32, ni collision.Node) bool {
		switch nearEntity := ni.(type) {
		// Mob -> Mob
		case *Mob:
			{
				if nearEntity.Id == m.Id {
					return true
				}

				if nearEntity.WasEliminated(wp) {
					return true
				}

				nearEntityIsProjectile := slices.Contains(ProjectileMobTypes, nearEntity.Type)

				nearEntityIsEnemyMissile := nearEntity.IsEnemyMissile()

				nearEntityIsEnemy := nearEntity.IsEnemy()

				{
					// Enemy missile cant collide to enemy mob
					if (mIsProjectile && mIsEnemyMissile && nearEntityIsEnemy) ||
						(nearEntityIsProjectile && nearEntityIsEnemyMissile && mIsEnemy) {
						return true
					}

					// Friendly missile cant collide to friendly mob
					if (mIsProjectile && !mIsEnemyMissile && !nearEntityIsEnemy) ||
						(nearEntityIsProjectile && !nearEntityIsEnemyMissile && !mIsEnemy) {
						return true
					}
				}

				c1 := collision.Circle{X: nearEntity.X, Y: nearEntity.Y, R: nearEntity.CalculateRadius()}

				px, py, ok := collision.ComputeCirclePush(c0, c1)
				if ok {
					m.X -= px * mobToMobPushMultiplier
					m.Y -= py * mobToMobPushMultiplier

					nearEntity.X += px * mobToMobPushMultiplier
					nearEntity.Y += py * mobToMobPushMultiplier

					// Mob doesnt damaged to mob
					if mIsEnemy && nearEntityIsEnemy {
						return true
					}

					// Pet doesnt damaged to other pet
					if !mIsEnemy && !nearEntityIsEnemy {
						return true
					}

					{ // Damage
						profile1 := native.MobProfiles[nearEntity.Type]

						nearEntityMaxHealth := nearEntity.GetMaxHealth()
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
				if nearEntity.WasEliminated(wp) {
					return true
				}

				// Petal doesnt damaged/knockbacked to pet
				if m.PetMaster != nil {
					return true
				}

				// Dont collide if m is friendly mob
				if !mIsEnemy {
					return true
				}

				c1 := collision.Circle{X: nearEntity.X, Y: nearEntity.Y, R: nearEntity.CalculateRadius()}

				px, py, ok := collision.ComputeCirclePush(c0, c1)
				if ok {
					if !nearEntity.SpinningOnMob {
						m.X -= px * 0.1
						m.Y -= py * 0.1

						// Maybe dont collide to petal?
						nearEntity.X += px * 3
						nearEntity.Y += py * 3
					}

					{ // Damage
						nearEntityStat := native.PetalProfiles[nearEntity.Type].StatFromRarity(nearEntity.Rarity)

						nearEntityMaxHealth := nearEntity.GetMaxHealth()
						nearEntityDamage := nearEntityStat.GetDamage()

						m.Health -= nearEntityDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						// Petal specials
						switch nearEntity.Type {
						case native.PetalTypeFang:
							doFangLifesteal(nearEntity, nearEntityStat, nearEntityDamage)
						case native.PetalTypeLightning:
							wp.PetalDoLightningBounce(nearEntity, m)
						}

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
				// Dont collide to dead/uncollidable player
				if nearEntity.IsDead || !nearEntity.IsCollidable() {
					return true
				}

				// Dont damage/knockback to player
				if m.PetMaster != nil {
					return true
				}

				// Dont collide if m is friendly mob
				if !mIsEnemy {
					return true
				}

				c1 := collision.Circle{X: nearEntity.X, Y: nearEntity.Y, R: nearEntity.Size}

				px, py, ok := collision.ComputeCirclePush(c0, c1)
				if ok {
					m.X -= px
					m.Y -= py

					nearEntity.X += px * 5
					nearEntity.Y += py * 5

					{ // Damage
						nearEntityMaxHealth := nearEntity.GetMaxHealth()

						m.Health -= nearEntity.BodyDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						{ // Set LastAttackedEntity
							mTraversed.LastAttackedEntity = nearEntity
						}
					}
				}
			}
		}

		return true
	})
}

func doFangLifesteal(fang *Petal, stat native.PetalStat, damage float64) {
	if fang.Master == nil {
		return
	}

	healDamaged, ok := stat.Extra["damageHealed"].(float64)
	if !ok {
		return
	}

	master := fang.Master
	if master.Health >= 1 {
		return
	}

	masterMaxHP := master.GetMaxHealth()
	healAmount := damage * (healDamaged / 100)

	master.Health = min(1, master.Health+(healAmount/masterMaxHP))
}
