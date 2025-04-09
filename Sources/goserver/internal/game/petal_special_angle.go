package game

import (
	"math"

	"flooooio/internal/native"
)

func (p *Petal) PetalSpecialAngle(wp *WavePool) {
	if p.DetachedFromOrbit {
		return
	}

	switch p.Type {
	// Always up direction
	case native.PetalTypeEggBeetle:
		{
			p.Angle = 0
		}

	default:
		{
			p.Angle += 0.3
		}
	}

	p.Angle = math.Mod(p.Angle, 255)
}
