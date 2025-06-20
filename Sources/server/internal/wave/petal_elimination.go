package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"
)

func (p *Petal) onEliminate(wp *WavePool) {
	switch p.Type {
	// If stick is destoryed, sandstorms destoryed too
	case native.PetalTypeMysteriousStick:
		{
			for _, p := range p.SummonedPets {
				if p != nil && !p.WasEliminated(wp) {
					p.ForceEliminate(wp)
				}
			}
		}
	}

	// SummonedPets are cleared in Dispose

	wp.RemovePetal(*p.Id)
}

func (p *Petal) PetalElimination(wp *WavePool, _ time.Time) {
	if !p.WasEliminated(wp) && 0 >= p.Health {
		p.onEliminate(wp)
	}
}

// ForceEliminate forces eliminate a petal.
//
// Warning: This behaves the same as when this petal is "naturally" removed.
// This mean binded entities may also be deleted. If this behavior is not desired, use wp.RemovePetal instead.
func (p *Petal) ForceEliminate(wp *WavePool) {
	p.Health = 0

	p.onEliminate(wp)
}

// CompletelyRemove is like ForceEliminate, but remove it binding too.
func (p *Petal) CompletelyRemove(wp *WavePool) {
	p.Mu.Lock() // Lock for wave.ResetPlayerBindings()

	if !p.WasEliminated(wp) {
		// Remove summoned mob
		if p.SummonedPets != nil {
			for _, m := range p.SummonedPets {
				m.Mu.Lock() // Lock for wave.ResetPlayerBindings()

				if m != nil && !m.WasEliminated(wp) {
					m.ForceEliminate(wp)
				}

				m.Mu.Unlock()
			}
		}

		p.ForceEliminate(wp)
	}

	p.Mu.Unlock()
}
