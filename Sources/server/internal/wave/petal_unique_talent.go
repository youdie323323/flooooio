package wave

import (
	"math/rand/v2"
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

const (
	fasterRagingApplyMS = 50
)

func (p *Petal) PetalUniqueTalent(wp *WavePool, now time.Time) {
	switch p.Type {
	case native.PetalTypeFaster:
		{
			if now.Sub(p.LastVelocityApplied) >= fasterRagingApplyMS*time.Millisecond {
				p.AddRandomVelocity(6 * rand.Float32())

				p.LastVelocityApplied = now
			}
		}

	case native.PetalTypeMissile:
		{
			if !p.Detached {
				return
			}

			angle := p.Angle / angleFactor

			p.X += 10 * math32.Cos(angle)
			p.Y += 10 * math32.Sin(angle)
		}
	}
}

func (p *Petal) AddRandomVelocity(speed float32) {
	angle := Tau32 * rand.Float32()

	p.Velocity[0] += speed * math32.Cos(angle)
	p.Velocity[1] += speed * math32.Sin(angle)
}
