package wave

import "time"

const (
	PetalVelocityFriction = 0.875
)

func (p *Petal) PetalCoordinateMovement(wp *WavePool, _ time.Time) {
	p.Velocity[0] *= PetalVelocityFriction
	p.Velocity[1] *= PetalVelocityFriction

	p.X += p.Velocity[0]
	p.Y += p.Velocity[1]
}
