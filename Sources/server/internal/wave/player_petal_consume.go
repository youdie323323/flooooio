package wave

import (
	"math"
	"slices"
	"time"

	"flooooio/internal/native"
)

const (
	bubbleBounceForce = 25.

	yggdrasilPushForce = 10.
)

var summonTypeMapping = map[native.PetalType]native.MobType{
	native.PetalTypeEggBeetle: native.MobTypeBeetle,
	native.PetalTypeStick:     native.MobTypeSandstorm,
}

func (p *Player) PlayerPetalConsume(wp *WavePool) {
	if p.IsDead {
		return
	}

	isSad := p.Mood.IsSet(native.MoodSad)

	totalForceX := 0.
	totalForceY := 0.

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

			now := time.Now()

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

						distance := math.Hypot(dx, dy)

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

					distance := math.Hypot(dx, dy)

					if distance > 0 {
						totalForceX += dx / distance * bubbleBounceForce
						totalForceY += dy / distance * bubbleBounceForce
					}
				}
			}

			// If succeed consume, reset cooldown
			usageCooldown[j] = time.Time{}
		}
	}

	p.Velocity[0] += totalForceX
	p.Velocity[1] += totalForceY
}
