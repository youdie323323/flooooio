package wave

import (
	"slices"
	"time"

	"flooooio/internal/native"

	"github.com/chewxy/math32"
)

const (
	bubbleBounceForce = 25.

	yggdrasilPushForce = 10.
)

var summonTypeMapping = map[native.PetalType]native.MobType{
	native.PetalTypeEggBeetle: native.MobTypeBeetle,
	native.PetalTypeStick:     native.MobTypeSandstorm,
}

func (p *Player) PlayerPetalConsume(wp *WavePool, now time.Time) {
	if p.IsDead {
		return
	}

	isSad := p.Mood.IsSet(native.MoodSad)

	var totalForceX float32 = 0.
	var totalForceY float32 = 0.

	usageCooldownGrid := p.Slots.UsageCooldownGrid

	for i, petals := range p.Slots.Surface {
		if petals == nil {
			continue
		}

		for j, petal := range petals {
			if petal == nil {
				continue
			}

			if petal.WasEliminated(wp) {
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
					wp.RemovePetal(*petal.Id)

					// Its not really multiple beetles because removing petal have usage cooldown resetted
					petal.SummonedPets = append(petal.SummonedPets, wp.GenerateMob(
						summonTypeMapping[petal.Type],

						max(native.RarityCommon, min(native.RarityMythic, petal.Rarity-1)),

						petal.X,
						petal.Y,

						p,

						nil,
						false,

						nil,
					))
				}

			case native.PetalTypeYggdrasil:
				{
					// Already used yggdrasil
					if petal.DetachedFromOrbit {
						continue
					}

					// Detach
					petal.DetachedFromOrbit = true

					{
						dx := petal.X - p.X
						dy := petal.Y - p.Y

						distance := math32.Hypot(dx, dy)

						if distance > 0 {
							dirX := dx / distance
							dirY := dy / distance

							petal.X += dirX * yggdrasilPushForce
							petal.Y += dirY * yggdrasilPushForce
						}
					}

					// TODO: implement logic
				}

			case native.PetalTypeStick:
				{
					// TODO: add limit

					petal.SummonedPets = append(petal.SummonedPets, wp.GenerateMob(
						summonTypeMapping[petal.Type],

						max(native.RarityCommon, min(native.RarityMythic, petal.Rarity-1)),

						petal.X,
						petal.Y,

						p,

						nil,
						false,

						nil,
					))
				}

			case native.PetalTypeBubble:
				{
					if !isSad {
						continue
					}

					// Remove petal as it consumed
					wp.RemovePetal(*petal.Id)

					dx := p.X - petal.X
					dy := p.Y - petal.Y

					distance := math32.Hypot(dx, dy)

					if distance > 0 {
						totalForceX += dx / distance * bubbleBounceForce
						totalForceY += dy / distance * bubbleBounceForce
					}
				}

			case native.PetalTypeWeb:
				{
					if petal.DetachedFromOrbit {
						// Detached, use web if stop
						if petal.Velocity[0] < VelocityEpsilon && petal.Velocity[1] < VelocityEpsilon {
							wp.GenerateMob(
								native.MobTypeWebProjectile,

								petal.Rarity,

								petal.X,
								petal.Y,

								// We dont need a web from the enemy side
								// Web is only valid to mob
								nil, // p,

								nil,
								false,

								nil,
							)

							// Remove petal as it consumed
							wp.RemovePetal(*petal.Id)
						}

						continue
					}

					if !isSad {
						continue
					}

					// Already used web
					if petal.DetachedFromOrbit {
						continue
					}

					// Detach
					petal.DetachedFromOrbit = true

					dx := petal.X - p.X
					dy := petal.Y - p.Y

					// Calculate angle from player to petal
					angle := math32.Atan2(dy, dx)

					petal.Velocity[0] += 30 * math32.Cos(angle)
					petal.Velocity[1] += 30 * math32.Sin(angle)
				}
			}

			// If succeed consume, reset cooldown
			usageCooldown[j] = time.Time{}
		}
	}

	p.Velocity[0] += totalForceX
	p.Velocity[1] += totalForceY
}
