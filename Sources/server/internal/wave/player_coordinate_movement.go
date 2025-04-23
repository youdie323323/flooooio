package wave

const (
	PlayerMovementFriction = 0.85
)

func (p *Player) PlayerCoordinateMovement(wp *WavePool) {
	p.Velocity[0] += p.Accel[0]
	p.Velocity[1] += p.Accel[1]

	p.Velocity[0] *= PlayerMovementFriction
	p.Velocity[1] *= PlayerMovementFriction

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
