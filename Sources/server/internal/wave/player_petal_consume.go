package wave

import (
	"slices"
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

var summonPetsData = map[native.PetalType]map[native.Rarity]StaticMobData{
	native.PetalTypeEggBeetle: {
		native.RarityCommon:    StaticMobData{native.MobTypeBabyAnt, native.RarityCommon},
		native.RarityUnusual:   StaticMobData{native.MobTypeWorkerAnt, native.RarityUnusual},
		native.RarityRare:      StaticMobData{native.MobTypeSoldierAnt, native.RarityUnusual},
		native.RarityEpic:      StaticMobData{native.MobTypeBeetle, native.RarityUnusual},
		native.RarityLegendary: StaticMobData{native.MobTypeBeetle, native.RarityRare},
		native.RarityMythic:    StaticMobData{native.MobTypeBeetle, native.RarityLegendary},
		native.RarityUltra:     StaticMobData{native.MobTypeBeetle, native.RarityMythic},
	},
	native.PetalTypeMysteriousStick: {
		native.RarityCommon:    StaticMobData{native.MobTypeSandstorm, native.RarityRare},
		native.RarityUnusual:   StaticMobData{native.MobTypeSandstorm, native.RarityRare},
		native.RarityRare:      StaticMobData{native.MobTypeSandstorm, native.RarityRare},
		native.RarityEpic:      StaticMobData{native.MobTypeSandstorm, native.RarityRare},
		native.RarityLegendary: StaticMobData{native.MobTypeSandstorm, native.RarityRare},
		native.RarityMythic:    StaticMobData{native.MobTypeSandstorm, native.RarityRare},
		native.RarityUltra:     StaticMobData{native.MobTypeSandstorm, native.RarityEpic},
	},
}

const (
	petalBubbleBounceForce = 6

	petalYggdrasilPushForce = 2.5
)

func (p *Player) PlayerPetalConsume(wp *Pool, now time.Time) {
	if p.IsDead {
		return
	}

	isSad := p.Mood.IsSet(native.MoodSad)

	var totalForceX, totalForceY float32 = 0., 0.

	usageCooldownGrid := p.Slots.UsageCooldownGrid

	for i, petals := range p.Slots.Surface {
		if petals == nil {
			continue
		}

		for j, petal := range petals {
			if petal == nil {
				continue
			}

			if petal.IsEliminated(wp) {
				continue
			}

			if !slices.Contains(UsablePetalTypes, petal.Type) {
				continue
			}

			usageCooldown := usageCooldownGrid[i]

			if !(now.After(usageCooldown[j]) || now.Equal(usageCooldown[j])) {
				continue
			}

			switch petal.Type {
			case native.PetalTypeEggBeetle:
				{
					// Remove petal as it consumed
					wp.RemovePetal(petal.Id)

					smd := summonPetsData[petal.Type][petal.Rarity]

					// Its not really multiple beetles because removing petal have usage cooldown resetted
					petal.SummonedPets = append(petal.SummonedPets, wp.GenerateMob(
						smd.Type,

						smd.Rarity,

						petal.X,
						petal.Y,

						p,

						nil,
						false,
					))
				}

			case native.PetalTypeYggdrasil:
				{
					// Already used yggdrasil
					if petal.Detached {
						continue
					}

					// Detach
					petal.Detached = true

					{
						dx := petal.X - p.X
						dy := petal.Y - p.Y

						distance := math32.Hypot(dx, dy)

						if distance > 0 {
							dirX := dx / distance
							dirY := dy / distance

							petal.Velocity[0] += dirX * petalYggdrasilPushForce
							petal.Velocity[1] += dirY * petalYggdrasilPushForce
						}
					}

					// TODO: implement logic
				}

			case native.PetalTypeMysteriousStick:
				{
					if 1 > len(petal.SummonedPets) {
						smd := summonPetsData[petal.Type][petal.Rarity]

						petal.SummonedPets = append(petal.SummonedPets, wp.GenerateMob(
							smd.Type,

							smd.Rarity,

							petal.X,
							petal.Y,

							p,

							nil,
							false,
						))
					}
				}

			case native.PetalTypeBubble:
				{
					if !isSad {
						continue
					}

					// Remove petal as it consumed
					wp.RemovePetal(petal.Id)

					dx := p.X - petal.X
					dy := p.Y - petal.Y

					distance := math32.Hypot(dx, dy)

					if distance > 0 {
						totalForceX += dx / distance * petalBubbleBounceForce
						totalForceY += dy / distance * petalBubbleBounceForce
					}
				}

			case native.PetalTypeWeb:
				{
					if petal.Detached {
						// Detached, use web if stop
						if VectorWithinEpsilon(petal.Velocity) {
							wp.GenerateMob(
								native.MobTypeWebProjectile,

								petal.Rarity,

								petal.X,
								petal.Y,

								p,

								nil,
								false,
							)

							// Remove petal as it consumed
							wp.RemovePetal(petal.Id)
						}

						continue
					}

					if !isSad {
						continue
					}

					// Already used web
					if petal.Detached {
						continue
					}

					// Detach
					petal.Detached = true

					dx, dy := petal.X-p.X, petal.Y-p.Y

					// Calculate angle from player to petal
					angle := math32.Atan2(dy, dx)

					petal.Velocity[0] += 20 * math32.Cos(angle)
					petal.Velocity[1] += 20 * math32.Sin(angle)
				}

			case native.PetalTypeMissile:
				{
					if !isSad {
						continue
					}

					// Already used missile
					if petal.Detached {
						continue
					}

					// Detach
					petal.Detached = true

					p.Slots.SurfaceSupplies[i][j] = &StaticPetalData{
						Type:   petal.Type,
						Rarity: petal.Rarity,
					}

					// Embed p data into supplies, then set to nil
					// PlayerPetalReload will recognize SurfaceSupplies and reloads when petals[j] is equals to nil
					petals[j] = nil
				}
			}

			// If succeed consume, reset cooldown
			usageCooldown[j] = time.Time{}
		}
	}

	p.Velocity[0] += totalForceX
	p.Velocity[1] += totalForceY
}
