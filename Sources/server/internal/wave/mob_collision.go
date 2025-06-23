package wave

import (
	"cmp"
	"time"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"
)

const (
	mobToMobKnockbackMultiplier = 0.5

	maxMobToPlayerVelocity = 15.0

	webSlowPercent = (100. - 75.) / 100.
)

var ( // Define reusable circle
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

	mType := m.Type

	mProfile := native.MobProfiles[mType]
	mStat := mProfile.StatFromRarity(m.Rarity)

	mCollision := mProfile.Collision

	mToDamage := m.GetMobToDamage(wp)

	// Hmm health should only used mMobToDamage?
	// NOTE: yea because mMaxHealth is used as
	// mMobToDamage.Health -= somedamage / mMaxHealth
	mMaxHealth := mToDamage.GetMaxHealth()
	mDamage := mStat.GetDamage()

	mTraversed := TraverseMobSegments(wp, m)

	mIsWeb := mType == native.MobTypeWebProjectile

	mIsProjectile := m.IsProjectile()

	mIsEnemy := m.IsEnemy()
	mIsAlly := !mIsEnemy

	c0mob.X = m.X
	c0mob.Y = m.Y
	c0mob.R = m.CalculateRadius()

	searchRadius := CalculateSearchRadius(mCollision, m.Size)

	nearby := wp.SpatialHash.Search(m.X, m.Y, searchRadius)

	for _, n := range nearby {
		switch nearEntity := n.(type) {
		// Mob -> Mob
		case *Mob:
			{
				if nearEntity.Id == m.Id {
					continue
				}

				// Web only activated by m
				if nearEntity.Type == native.MobTypeWebProjectile {
					continue
				}

				// This is most simple lag mitigation, but this constrain the all MagnitudeMultiplier must unique
				//
				// Avoid redundant calculation if mob is already slowed this frame
				if mIsWeb && nearEntity.MagnitudeMultiplier == webSlowPercent {
					continue
				}

				if nearEntity.WasEliminated(wp) {
					continue
				}

				// Adjacent segment should not collide eachother
				if IsConnectedSegment(m, nearEntity) {
					continue
				}

				nearEntityIsProjectile := nearEntity.IsProjectile()

				nearEntityIsEnemy := nearEntity.IsEnemy()
				nearEntityIsAlly := !nearEntityIsEnemy

				if mIsProjectile || nearEntityIsProjectile {
					// Enemy missile cannot collide to enemy mob
					if mIsEnemy && nearEntityIsEnemy {
						continue
					}

					// Friendly missile cannot collide to friendly mob
					if mIsAlly && nearEntityIsAlly {
						continue
					}
				}

				c1mob.X = nearEntity.X
				c1mob.Y = nearEntity.Y
				c1mob.R = nearEntity.CalculateRadius()

				px, py, ok := collision.ComputeCirclePush(c0mob, c1mob)
				if ok {
					// Slows mob which colliding
					if mIsWeb {
						// TODO: enemy web not slows pets?
						if nearEntity.IsOrganismEnemy() && (mIsEnemy != nearEntityIsEnemy) {
							nearEntity.MagnitudeMultiplier = webSlowPercent
						}

						// Web does nothing
						continue
					}

					m.X -= px * mobToMobKnockbackMultiplier
					m.Y -= py * mobToMobKnockbackMultiplier

					nearEntity.X += px * mobToMobKnockbackMultiplier
					nearEntity.Y += py * mobToMobKnockbackMultiplier

					// Mob doesnt damaged to mob
					if mIsEnemy && nearEntityIsEnemy {
						continue
					}

					// Pet doesnt damaged to other pet
					if mIsAlly && nearEntityIsAlly {
						continue
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
							// To avoid this we need to return sufficient collision amount in ComputeCirclePush

							if nearEntity.IsAlly() {
								mTraversed.LastAttackedEntity = nearEntity.PetMaster
							}
						}
					}
				}
			}

		case *Petal:
			{
				// Petal doesnt damaged/knockbacked to pet
				if mIsAlly {
					continue
				}

				// Web not valid to petal
				if mIsWeb {
					continue
				}

				if nearEntity.WasEliminated(wp) {
					continue
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
				if mIsAlly {
					continue
				}

				// Dont collide to dead/uncollidable player
				if nearEntity.IsDead || !nearEntity.IsCollidable() {
					continue
				}

				// Avoid redundant calculation if mob is already slowed this frame
				if mIsWeb && nearEntity.MagnitudeMultiplier == webSlowPercent {
					continue
				}

				c1mob.X = nearEntity.X
				c1mob.Y = nearEntity.Y
				c1mob.R = nearEntity.Size

				px, py, ok := collision.ComputeCirclePush(c0mob, c1mob)
				if ok {
					// Slows player which colliding
					if mIsWeb {
						nearEntity.MagnitudeMultiplier = webSlowPercent

						// Web does nothing
						continue
					}

					m.X -= px
					m.Y -= py

					nearEntity.Velocity[0] += Clamp(px*2, -maxMobToPlayerVelocity, maxMobToPlayerVelocity)
					nearEntity.Velocity[1] += Clamp(py*2, -maxMobToPlayerVelocity, maxMobToPlayerVelocity)

					{ // Damage
						nearEntityMaxHealth := nearEntity.GetMaxHealth()

						mToDamage.Health -= nearEntity.BodyDamage / mMaxHealth
						nearEntity.Health -= mDamage / nearEntityMaxHealth

						switch mType {
						case native.MobTypeScorpion:
							scropionPoisonPlayer(mStat, nearEntity)
						}

						{ // Set LastAttackedEntity
							mTraversed.LastAttackedEntity = nearEntity
						}
					}
				}
			}
		}
	}

	nearby = nil
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

const clawDamagableHealthLimit = (100. - 20.) / 100.

func clawTakeExtraDamage(claw *Petal, stat native.PetalStat, hitMob *Mob) {
	if claw.Master == nil {
		return
	}

	if hitMob.Health < clawDamagableHealthLimit {
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

func scropionPoisonPlayer(scorpionStat native.MobStat, target *Player) {
	poisonDPS, ok := scorpionStat.Extra["poisonDPS"]
	if !ok {
		return
	}

	totalPoison, ok := scorpionStat.Extra["totalPoison"]
	if !ok {
		return
	}

	if poisonDPS > target.PoisonDPS {
		target.PoisonDPS = poisonDPS
		target.StopAtPoison = totalPoison
	}

	target.IsPoisoned.Store(true)
	target.TotalPoison = 0
}
