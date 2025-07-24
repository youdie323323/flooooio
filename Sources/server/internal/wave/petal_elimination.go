package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"
)

func (p *Petal) onEliminate(wp *Pool) {
	switch p.Type {
	// If stick is destoryed, sandstorms destoryed too
	case native.PetalTypeMysteriousStick:
		{
			for _, mob := range p.SummonedPets {
				if mob != nil && !mob.IsEliminated(wp) {
					mob.ForceEliminate(wp)
				}
			}
		}
	}

	// SummonedPets are cleared in Dispose

	wp.RemovePetal(p.Id)
}

func (p *Petal) PetalElimination(wp *Pool, _ time.Time) {
	if p.IsEliminated(wp) {
		return
	}

	if 0 >= p.Health {
		p.onEliminate(wp)
	}
}

// ForceEliminate forces eliminate a petal.
//
// Warning: This behaves the same as when this petal is "naturally" removed.
// This mean binded entities may also be deleted. If this behavior is not desired, use wp.RemovePetal instead.
func (p *Petal) ForceEliminate(wp *Pool) {
	p.Health = 0

	p.onEliminate(wp)
}

// CompletelyRemove is like ForceEliminate, but removes its bindings too.
func (p *Petal) CompletelyRemove(wp *Pool) {
	if !p.IsEliminated(wp) {
		// Remove summoned mob
		if p.SummonedPets != nil {
			for _, mob := range p.SummonedPets {
				if mob != nil && !mob.IsEliminated(wp) {
					mob.ForceEliminate(wp)
				}
			}
		}

		p.ForceEliminate(wp)
	}
}
