package wave

func (p *Petal) PetalElimination(wp *WavePool) {
	if !IsDeadNode(wp, p) && 0 >= p.Health {
		wp.RemovePetal(*p.Id)
	}
}
