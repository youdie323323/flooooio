package wave

import "time"

const (
	PlayerMovementMu = .9
)

func (p *Player) PlayerCoordinateMovement(wp *WavePool, _ time.Time) {
	p.Velocity[0] += p.Accel[0]
	p.Velocity[1] += p.Accel[1]

	p.Velocity[0] *= PlayerMovementMu
	p.Velocity[1] *= PlayerMovementMu

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
