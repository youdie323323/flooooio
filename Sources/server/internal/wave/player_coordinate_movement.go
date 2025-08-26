package wave

import "time"

const PlayerMovementVelocityMu = .9

func (p *Player) PlayerCoordinateMovement(wp *Pool, _ time.Time) {
	p.Velocity[0] += p.MagnitudeMultiplier * p.Acceleration[0]
	p.Velocity[1] += p.MagnitudeMultiplier * p.Acceleration[1]

	p.Velocity[0] *= PlayerMovementVelocityMu
	p.Velocity[1] *= PlayerMovementVelocityMu

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
