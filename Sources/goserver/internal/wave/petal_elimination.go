package wave

func (p *Petal) PetalElimination(wp *WavePool) {
	if !p.WasEliminated(wp) && 0 >= p.Health {
		wp.RemovePetal(*p.Id)
	}
}
