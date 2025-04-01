package wave

import (
	"slices"
	"time"

	"flooooio/internal/native"
)

var UsageReloadPetalTypes = []native.PetalType{
	native.PetalTypeEggBeetle,
	native.PetalTypeBubble,
}

func (p *Player) PlayerPetalReload(wp *WavePool) {
	if p.IsDead {
		return
	}

	surface := p.Slots.Surface

	reloadCooldownGrid := p.Slots.ReloadCooldownGrid
	usageCooldownGrid := p.Slots.UsageCooldownGrid

	// Reload cooldown
	for i, s := range surface {
		if s == nil {
			continue
		}

		for j, pe := range s {
			if pe == nil {
				continue
			}

			// Petal breaked, start reloading
			if pe.WasEliminated(wp) {
				// If summoned mob is not dead, not reloading
				if pe.SummonedPet != nil && !pe.SummonedPet.WasEliminated(wp) {
					continue
				}

				peReloadCooldown := reloadCooldownGrid[i]

				now := time.Now()

				if peReloadCooldown[j].IsZero() {
					peReloadCooldown[j] = now.Add(time.Duration(native.PetalProfiles[pe.Type].StatFromRarity(pe.Rarity).PetalReload * float64(time.Second)))
				} else if now.After(peReloadCooldown[j]) || now.Equal(peReloadCooldown[j]) {
					// If cooldown elapsed

					s[j] = wp.GeneratePetal(
						pe.Type,

						pe.Rarity,

						// Make it player coordinate so its looks like spawning from player body
						// TODO: It may not appear to be coming from the player, because the setInterval for sending update packets and
						// the setInterval for update are different. To solve this, delay PlayerPetalOrbit
						p.X,
						p.Y,

						p,

						false,
					)

					// Zero
					peReloadCooldown[j] = time.Time{}
				}
			}
		}
	}

	// Usage cooldown
	for i, s := range surface {
		if s == nil {
			continue
		}

		for j, pe := range s {
			if pe == nil {
				continue
			}

			if !slices.Contains(UsageReloadPetalTypes, pe.Type) {
				continue
			}

			peUsageCooldown := usageCooldownGrid[i]

			if pe.WasEliminated(wp) {
				// Reset cooldown because its breaked
				peUsageCooldown[j] = time.Time{}
			} else {
				if peUsageCooldown[j].IsZero() {
					now := time.Now()

					peUsageReload, ok := native.PetalProfiles[pe.Type].StatFromRarity(pe.Rarity).Extra["usageReload"].(float64)
					if !ok {
						continue
					}

					peUsageCooldown[j] = now.Add(time.Duration(peUsageReload * float64(time.Second)))
				}
			}
		}
	}
}
