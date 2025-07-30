package wave

import (
	"slices"
	"time"

	"flooooio/internal/wave/florr/native"
)

var UsablePetalTypes = []native.PetalType{
	native.PetalTypeEggBeetle,
	native.PetalTypeBubble,
	native.PetalTypeMysteriousStick,
	native.PetalTypeYggdrasil,
	native.PetalTypeWeb,
	native.PetalTypeMissile,
}

func (p *Player) PlayerPetalReload(wp *Pool, now time.Time) {
	if p.IsDead {
		return
	}

	surface := p.Slots.Surface
	surfaceSupplies := p.Slots.SurfaceSupplies

	reloadCooldownGrid := p.Slots.ReloadCooldownGrid
	usageCooldownGrid := p.Slots.UsageCooldownGrid

	// Reload cooldown
	for i, petals := range surface {
		if petals == nil {
			continue
		}

		for j, petal := range petals {
			if petal == nil { // If petal is nil and there is appropriate supply for petal, we can use supply for reload
				supplies := surfaceSupplies[i]
				if supplies != nil {
					supply := supplies[j]
					if supply != nil {
						peReloadCooldown := reloadCooldownGrid[i]

						if peReloadCooldown[j].IsZero() {
							peReloadCooldown[j] = now.Add(
								time.Duration(native.PetalProfiles[supply.Type].StatFromRarity(supply.Rarity).Reload * float32(time.Second)),
							)
						} else if now.After(peReloadCooldown[j]) || now.Equal(peReloadCooldown[j]) {
							// If cooldown elapsed

							petals[j] = wp.GeneratePetal(
								supply.Type,

								supply.Rarity,

								// Make it player coordinate so its looks like spawning from player body
								p.X,
								p.Y,

								p,

								false,
							)

							// Zero
							peReloadCooldown[j] = time.Time{}

							// No need this supply anymore, dispose
							supplies[j] = nil
						}
					}
				}

				continue
			}

			// Remove summoned pet memory from summond pets instantly
			for i, pet := range petal.SummonedPets {
				if pet != nil && pet.IsEliminated(wp) {
					petal.SummonedPets = slices.Delete(petal.SummonedPets, i, i+1)
				}
			}

			// Petal breaked, start reloading
			if petal.IsEliminated(wp) {
				switch petal.Type {
				case native.PetalTypeEggBeetle:
					{
						// If summoned pets is not eliminated, not reload
						// We already deleted eliminated pets, so just check the length
						if len(petal.SummonedPets) > 0 {
							continue
						}
					}
				}

				peReloadCooldown := reloadCooldownGrid[i]

				if peReloadCooldown[j].IsZero() {
					peReloadCooldown[j] = now.Add(
						time.Duration(native.PetalProfiles[petal.Type].StatFromRarity(petal.Rarity).Reload * float32(time.Second)),
					)
				} else if now.After(peReloadCooldown[j]) || now.Equal(peReloadCooldown[j]) {
					// If cooldown elapsed

					petals[j] = wp.GeneratePetal(
						petal.Type,

						petal.Rarity,

						// Make it player coordinate so its looks like spawning from player body
						p.X,
						p.Y,

						p,

						false,
					)

					petals[j].SummonedPets = petal.SummonedPets

					// Dispose pe summoned pets because we no longer need this in the memory
					petal.SummonedPets = nil

					// Zero
					peReloadCooldown[j] = time.Time{}
				}
			}
		}
	}

	// Usage cooldown
	for i, petals := range surface {
		if petals == nil {
			continue
		}

		for j, petal := range petals {
			if petal == nil {
				continue
			}

			if !slices.Contains(UsablePetalTypes, petal.Type) {
				continue
			}

			peUsageCooldown := usageCooldownGrid[i]

			if petal.IsEliminated(wp) {
				// Reset cooldown because its broke
				peUsageCooldown[j] = time.Time{}
			} else {
				if peUsageCooldown[j].IsZero() {
					usageReload := native.PetalProfiles[petal.Type].StatFromRarity(petal.Rarity).UsageReload
					if usageReload == nil {
						continue
					}

					peUsageCooldown[j] = now.Add(time.Duration(*usageReload * float32(time.Second)))
				}
			}
		}
	}
}
