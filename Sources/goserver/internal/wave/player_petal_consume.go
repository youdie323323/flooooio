package wave

import (
	"math"
	"slices"
	"time"

	"flooooio/internal/native"
)

const (
	bubbleBounceForce         = 20.
	bubbleVelocityAttenuation = .8
)

var eggTypeMapping = map[native.PetalType]native.MobType{
	native.PetalTypeEggBeetle: native.MobTypeBeetle,
}

func (p *Player) PlayerPetalConsume(wp *WavePool) {
	if p.IsDead {
		return
	}

	p.BubbleVelocity[0] *= bubbleVelocityAttenuation
	p.BubbleVelocity[1] *= bubbleVelocityAttenuation

	isSad := p.Mood.IsSet(native.MoodSad)

	totalForceX := 0.
	totalForceY := 0.

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

			if !slices.Contains(UsageReloadPetalTypes, petal.Type) {
				continue
			}

			now := time.Now()

			if !(now.After(p.Slots.UsageCooldownGrid[i][j]) || now.Equal(p.Slots.UsageCooldownGrid[i][j])) {
				continue
			}

			switch petal.Type {
			case native.PetalTypeEggBeetle:
				{
					// Remove mob as it consumed
					wp.RemovePetal(*petal.Id)

					petal.SummonedPet = wp.GenerateMob(
						eggTypeMapping[petal.Type],

						max(native.RarityCommon, min(native.RarityMythic, petal.Rarity-1)),

						petal.X,
						petal.Y,

						p,

						nil,
						false,
					)
				}

			case native.PetalTypeBubble:
				{
					if !isSad {
						continue
					}

					// Remove mob as it consumed
					wp.RemovePetal(*petal.Id)

					dx := p.X - petal.X
					dy := p.Y - petal.Y

					distance := math.Hypot(dx, dy)

					if distance > 0 {
						totalForceX += dx / distance
						totalForceY += dy / distance
					}
				}
			}
		}
	}

	p.BubbleVelocity[0] += totalForceX
	p.BubbleVelocity[1] += totalForceY

	p.X += p.BubbleVelocity[0] * bubbleBounceForce
	p.Y += p.BubbleVelocity[1] * bubbleBounceForce
}
