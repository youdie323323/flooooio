package wave

const (
	PlayerMovementMu = .8
)

func (p *Player) PlayerCoordinateMovement(wp *WavePool) {
	p.Velocity[0] += p.Accel[0]
	p.Velocity[1] += p.Accel[1]

	p.Velocity[0] *= PlayerMovementMu
	p.Velocity[1] *= PlayerMovementMu

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
