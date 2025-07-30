package wave

import "time"

const PetalMovementVelocityMu = 0.875

func (p *Petal) PetalCoordinateMovement(wp *Pool, _ time.Time) {
	p.Velocity[0] *= PetalMovementVelocityMu
	p.Velocity[1] *= PetalMovementVelocityMu

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
