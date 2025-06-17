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

func (p *Petal) PetalFasterRaging(wp *WavePool, now time.Time) {
	if p.Type != native.PetalTypeFaster {
		return
	}

	if now.Sub(p.LastVelocityApplied) >= fasterRagingApplyMS*time.Millisecond {
		p.AddRandomVelocity(rand.Float32() * 6)

		p.LastVelocityApplied = now
	}
}

func (p *Petal) AddRandomVelocity(speed float32) {
	angle := Tau * rand.Float32()

	p.Velocity[0] += speed * math32.Cos(angle)
	p.Velocity[1] += speed * math32.Sin(angle)
}
