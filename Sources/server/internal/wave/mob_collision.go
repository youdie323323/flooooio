package wave

import (
	"cmp"
	"time"

	"flooooio/internal/collision"
	"flooooio/internal/native"
)

const (
	mobToMobPushMultiplier = 0.5

	maxMobToPlayerVelocity = 30.0

	webSlowPercent = (100. - 75.) / 100.
)

// Define reusable circle
var (
	c0mob collision.Circle
	c1mob collision.Circle
)

// Clamp returns f clamped to [low, high].
func Clamp[T cmp.Ordered](f, low, high T) T {
	return min(max(f, low), high)
}

func (m *Mob) MobCollision(wp *WavePool, _ time.Time) {
	if m.WasEliminated(wp) {
		return
	}

	// Turn back to original multiplier
	m.MagnitudeMultiplier = 1

	profile0 := native.MobProfiles[m.Type]

	collision0 := profile0.Collision

	mToDamage := m.GetMobToDamage(wp)

	// Hmm health should only used mMobToDamage?
	// NOTE: yea because mMaxHealth is used as
	// mMobToDamage.Health -= somedamage / mMaxHealth
	mMaxHealth := mToDamage.GetMaxHealth()
	mDamage := profile0.StatFromRarity(m.Rarity).GetDamage()

	mTraversed := TraverseMobSegments(wp, m)

	mIsProjectile := m.IsProjectile()

	mIsEnemyMissile := m.IsEnemyMissile()
	mIsNotEnemyMissile := !mIsEnemyMissile

	mIsEnemy := m.IsEnemy()
	mIsNotEnemy := !mIsEnemy

	mIsWeb := m.Type == native.MobTypeWebProjectile

	c0mob.X = m.X
	c0mob.Y = m.Y
	c0mob.R = m.CalculateRadius()

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

				// Web only activated by m
				if nearEntity.Type == native.MobTypeWebProjectile {
					return true
				}

				if nearEntity.WasEliminated(wp) {
					return true
				}

				// Adjacent segment should not collide eachother
				if IsConnectedSegment(m, nearEntity) {
					return true
				}

				nearEntityIsProjectile := nearEntity.IsProjectile()

				nearEntityIsEnemyMissile := nearEntity.IsEnemyMissile()

				nearEntityIsEnemy := nearEntity.IsEnemy()
				nearEntityIsNotEnemy := !nearEntityIsEnemy

				{
					// Enemy missile cant collide to enemy mob
					if (mIsProjectile && mIsEnemyMissile && nearEntityIsEnemy) ||
						(nearEntityIsProjectile && nearEntityIsEnemyMissile && mIsEnemy) {
						return true
					}

					// Friendly missile cant collide to friendly mob
					if (mIsProjectile && mIsNotEnemyMissile && nearEntityIsNotEnemy) ||
						(nearEntityIsProjectile && !nearEntityIsEnemyMissile && mIsNotEnemy) {
						return true
					}
				}

				c1mob.X = nearEntity.X
				c1mob.Y = nearEntity.Y
				c1mob.R = nearEntity.CalculateRadius()

				px, py, ok := collision.ComputeCirclePush(c0mob, c1mob)
				if ok {
					// Web does nothing
					// Slows mob which colliding
					if mIsWeb {
						nearEntity.MagnitudeMultiplier = webSlowPercent

						return true
					}

					m.X -= px * mobToMobPushMultiplier
					m.Y -= py * mobToMobPushMultiplier

					nearEntity.X += px * mobToMobPushMultiplier
					nearEntity.Y += py * mobToMobPushMultiplier

					// Mob doesnt damaged to mob
					if mIsEnemy && nearEntityIsEnemy {
						return true
					}

					// Pet doesnt damaged to other pet
					if mIsNotEnemy && nearEntityIsNotEnemy {
						return true
					}

					{ // Damage
						profile1 := native.MobProfiles[nearEntity.Type]

						nearEntityToDamage := nearEntity.GetMobToDamage(wp)

						nearEntityMaxHealth := nearEntityToDamage.GetMaxHealth()
						nearEntityDamage := profile1.StatFromRarity(nearEntity.Rarity).GetDamage()

						mToDamage.Health -= nearEntityDamage / mMaxHealth
						nearEntityToDamage.Health -= mDamage / nearEntityMaxHealth

						{ // Set LastAttackedEntity
							// TODO: this algorithm might collide like: mob1 -> mob2, mob2 -> mob1
							// So maybe its possible to do multiple hit once one frame
							// To avoid this we need to return sufficient amount collision in ComputeCirclePush

							if !nearEntity.IsEnemy() {
								mTraversed.LastAttackedEntity = nearEntity.PetMaster
							}
						}
					}
				}
			}

		case *Petal:
			{
				// Petal doesnt damaged/knockbacked to pet
				if mIsNotEnemy {
					return true
				}

				// Web not valid to petal
				if mIsWeb {
					return true
				}

				if nearEntity.WasEliminated(wp) {
					return true
				}

				c1mob.X = nearEntity.X
				c1mob.Y = nearEntity.Y
				c1mob.R = nearEntity.CalculateRadius()

				px, py, ok := collision.ComputeCirclePush(c0mob, c1mob)
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

						mToDamage.Health -= nearEntityDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						// Petal specials
						switch nearEntity.Type {
						case native.PetalTypeFang:
							fangDoLifesteal(nearEntity, nearEntityStat, nearEntityDamage)

						case native.PetalTypeClaw:
							clawTakeExtraDamage(nearEntity, nearEntityStat, mToDamage)

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
				// Pet dont damage/knockback to player
				if mIsNotEnemy {
					return true
				}

				// Web not valid to player
				if mIsWeb {
					return true
				}

				// Dont collide to dead/uncollidable player
				if nearEntity.IsDead || !nearEntity.IsCollidable() {
					return true
				}

				c1mob.X = nearEntity.X
				c1mob.Y = nearEntity.Y
				c1mob.R = nearEntity.Size

				px, py, ok := collision.ComputeCirclePush(c0mob, c1mob)
				if ok {
					m.X -= px
					m.Y -= py

					nearEntity.Velocity[0] += Clamp(px*2, -maxMobToPlayerVelocity, maxMobToPlayerVelocity)
					nearEntity.Velocity[1] += Clamp(py*2, -maxMobToPlayerVelocity, maxMobToPlayerVelocity)

					{ // Damage
						nearEntityMaxHealth := nearEntity.GetMaxHealth()

						mToDamage.Health -= nearEntity.BodyDamage / mMaxHealth
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

func fangDoLifesteal(fang *Petal, stat native.PetalStat, damage float32) {
	if fang.Master == nil {
		return
	}

	healDamaged, ok := stat.Extra["damageHealed"]
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

const clawExtraDamagableHPPercent = 80. / 100.

func clawTakeExtraDamage(claw *Petal, stat native.PetalStat, hitMob *Mob) {
	if claw.Master == nil {
		return
	}

	if hitMob.Health < clawExtraDamagableHPPercent {
		return
	}

	percentDamage, ok := stat.Extra["percentDamage"]
	if !ok {
		return
	}

	limit, ok := stat.Extra["limit"]
	if !ok {
		return
	}

	maxHealth := hitMob.GetMaxHealth()

	hitMob.Health -= min(hitMob.Health*(percentDamage/100), limit/maxHealth)
}
