package wave

import (
	"flooooio/internal/native"
	"time"

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

	default:
		{
			p.Angle += 0.3
		}
	}

	p.Angle = math32.Mod(p.Angle, 255)
}
