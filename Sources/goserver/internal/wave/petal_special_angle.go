package wave

import (
	"flooooio/internal/native"
	"math"
)

func (p *Petal) PetalSpecialAngle(wp *WavePool) {
	switch p.Type {
	// Always up direction
	case native.PetalTypeEggBeetle: {
		p.Angle = 0
	}

	case native.PetalTypeStick: {
		p.Angle += 0.2
	}
	}

	p.Angle = math.Mod(p.Angle, 255)
}
