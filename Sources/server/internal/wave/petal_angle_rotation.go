package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

func (p *Petal) PetalAngleRotation(wp *WavePool, _ time.Time) {
	if p.Detached {
		return
	}

	switch p.Type {
	// Always up direction
	case native.PetalTypeEggBeetle:
		{
			p.Angle = 0
		}

	case native.PetalTypeWing:
		{
			p.Angle += 5
		}

	case native.PetalTypeMagnet:
		{
			p.Angle += 0.6
		}

	case native.PetalTypeMissile:
		{
			if p.Detached {
				return
			}

			dx := p.X - p.Master.X
			dy := p.Y - p.Master.Y

			// Calculate angle from player to petal
			angle := math32.Mod(math32.Atan2(dy, dx)*angleFactor, 255)

			p.Angle = angle
		}

	default:
		{
			p.Angle += 0.3
		}
	}

	p.Angle = math32.Mod(p.Angle, 255)
}
