package wave

import (
	"time"

	"flooooio/internal/wave/florr/native"

	"github.com/chewxy/math32"
)

func (p *Petal) PetalSpecialAngle(wp *WavePool, _ time.Time) {
	if p.DetachedFromOrbit {
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

	default:
		{
			p.Angle += 0.3
		}
	}

	p.Angle = math32.Mod(p.Angle, 255)
}
