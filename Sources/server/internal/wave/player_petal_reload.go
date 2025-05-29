package wave

import (
	"slices"
	"time"

	"flooooio/internal/native"
)

var UsablePetalTypes = []native.PetalType{
	native.PetalTypeEggBeetle,
	native.PetalTypeBubble,
	native.PetalTypeStick,
	native.PetalTypeYggdrasil,
	native.PetalTypeWeb,
}

func (p *Player) PlayerPetalReload(wp *WavePool, now time.Time) {
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

			// Remove eliminated pets
			for i, pet := range pe.SummonedPets {
				if pet != nil && pet.WasEliminated(wp) {
					pe.SummonedPets = slices.Delete(pe.SummonedPets, i, i+1)
				}
			}

			// Petal breaked, start reloading
			if pe.WasEliminated(wp) {
				switch pe.Type {
				case native.PetalTypeEggBeetle:
					{
						// If summoned pets is not eliminated, not reload
						// Already deleted eliminated pets, so just check the length
						if len(pe.SummonedPets) > 0 {
							continue
						}
					}
				}

				peReloadCooldown := reloadCooldownGrid[i]

				if peReloadCooldown[j].IsZero() {
					peReloadCooldown[j] = now.Add(time.Duration(native.PetalProfiles[pe.Type].StatFromRarity(pe.Rarity).PetalReload * float32(time.Second)))
				} else if now.After(peReloadCooldown[j]) || now.Equal(peReloadCooldown[j]) {
					// If cooldown elapsed

					// We overriding petal so save summoned pets
					tempSummonedPets := pe.SummonedPets

					// Dispose pe summoned pets because we no longer have this in memory
					pe.SummonedPets = nil

					s[j] = wp.GeneratePetal(
						pe.Type,

						pe.Rarity,

						// Make it player coordinate so its looks like spawning from player body
						p.X,
						p.Y,

						p,

						false,
					)

					s[j].SummonedPets = tempSummonedPets

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

			if !slices.Contains(UsablePetalTypes, pe.Type) {
				continue
			}

			peUsageCooldown := usageCooldownGrid[i]

			if pe.WasEliminated(wp) {
				// Reset cooldown because its breaked
				peUsageCooldown[j] = time.Time{}
			} else {
				if peUsageCooldown[j].IsZero() {
					usageReload := native.PetalProfiles[pe.Type].StatFromRarity(pe.Rarity).UsageReload
					if usageReload == nil {
						continue
					}

					peUsageCooldown[j] = now.Add(time.Duration(*usageReload * float32(time.Second)))
				}
			}
		}
	}
}
