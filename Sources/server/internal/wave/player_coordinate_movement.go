package wave

import "time"

const (
	PlayerMovementMu = .9
)

func (p *Player) PlayerCoordinateMovement(wp *WavePool, _ time.Time) {
	p.Velocity[0] += p.Acceleration[0] * p.MagnitudeMultiplier
	p.Velocity[1] += p.Acceleration[1] * p.MagnitudeMultiplier

	p.Velocity[0] *= PlayerMovementMu
	p.Velocity[1] *= PlayerMovementMu

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
