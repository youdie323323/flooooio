package wave

import (
	"slices"

	"flooooio/internal/native"
)

func (p *Petal) onEliminate(wp *WavePool) {
	wp.RemovePetal(*p.Id)

	switch p.Type {
	// If stick is destoryed, sandstorms destoryed too
	case native.PetalTypeStick:
		{
			for i, pet := range p.SummonedPets {
				if pet != nil {
					if !pet.WasEliminated(wp) {
						pet.SafeForceEliminate(wp)
					}

					p.SummonedPets = slices.Delete(p.SummonedPets, i, i+1)
				}
			}
		}
	}
}

func (p *Petal) PetalElimination(wp *WavePool) {
	if !p.WasEliminated(wp) && 0 >= p.Health {
		p.onEliminate(wp)
	}
}

// ForceEliminate forces eliminate a petal.
//
// Warning: This behaves the same as when it is "naturally" removed.
// What this means is that binded entities may also be deleted. If this is not desired, use wp.RemovePetal instead.
func (p *Petal) ForceEliminate(wp *WavePool) {
	p.Health = 0

	p.onEliminate(wp)
}

func (p *Petal) SafeForceEliminate(wp *WavePool) {
	p.Mu.Lock()

	p.ForceEliminate(wp)

	p.Mu.Unlock()
}

func (p *Petal) CompletelyRemove(wp *WavePool) {
	// Remove petal itself
	if !p.WasEliminated(wp) {
		p.ForceEliminate(wp)
	}

	// Remove summoned mob
	if p.SummonedPets != nil {
		for _, p := range p.SummonedPets {
			if p != nil && !p.WasEliminated(wp) {
				p.ForceEliminate(wp)
			}
		}
	}
}
