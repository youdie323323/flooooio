package wave

import (
	"flooooio/internal/native"
	"slices"
)

func (p *Petal) onEliminate(wp *WavePool) {
	wp.RemovePetal(*p.Id)

	// If stick is destoryed, sandstorms destoryed too
	if p.Type == native.PetalTypeStick {
		for i, pet := range p.SummonedPets {
			if pet != nil {
				if !pet.WasEliminated(wp) {
					pet.InstantlyKill(wp)
				}

				p.SummonedPets = slices.Delete(p.SummonedPets, i, i+1)
			}
		}
	}
}

func (p *Petal) PetalElimination(wp *WavePool) {
	if !p.WasEliminated(wp) && 0 >= p.Health {
		p.onEliminate(wp)
	}
}

func (p *Petal) InstantlyKill(wp *WavePool) {
	p.Health = 0

	p.onEliminate(wp)
}