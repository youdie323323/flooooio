package wave

import (
	"math"
	"math/rand/v2"
	"time"

	"flooooio/internal/native"
)

const (
	applyMS = 50
)

func (p *Petal) PetalFasterRaging(wp *WavePool) {
	if p.Type != native.PetalTypeFaster {
		return
	}

	now := time.Now()

	if now.Sub(p.LastVelocityApplied) >= applyMS*time.Millisecond {
		p.AddRandomVelocity(rand.Float64() * 6)

		p.LastVelocityApplied = now
	}
}

func (p *Petal) AddRandomVelocity(speed float64) {
	angle := rand.Float64() * 2 * math.Pi

	p.Velocity[0] += speed * math.Cos(angle)
	p.Velocity[1] += speed * math.Sin(angle)
}
