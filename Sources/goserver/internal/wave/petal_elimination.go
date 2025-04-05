package wave

func (p *Petal) onEliminate(wp *WavePool) {
	wp.RemovePetal(*p.Id)
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