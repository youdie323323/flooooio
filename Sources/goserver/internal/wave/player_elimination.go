package wave

func (p *Player) PlayerElimination(wp *WavePool) {
	if !IsDeadNode(wp, p) && 0 >= p.Health {
		p.IsDead = true

		p.Health = 0

		// Stop move
		p.Magnitude = 0

		// TODO: removeAllBindings
	}
}
