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

// AddRandomVelocity adds random velocity to petal velocity using speed.
func (p *Petal) AddRandomVelocity(speed float32) {
	angle := Tau32 * rand.Float32()

	p.Velocity[0] += speed * math32.Cos(angle)
	p.Velocity[1] += speed * math32.Sin(angle)
}

func (p *Petal) PetalUniqueTalent(wp *Pool, now time.Time) {
	switch p.Type {
	case native.PetalTypeEggBeetle: // Always up direction
		{
			p.Angle = 0

			// No need to do default talent
			return
		}

	case native.PetalTypeWing:
		{
			p.Angle += 5

			goto AngleLimitation
		}

	case native.PetalTypeMagnet:
		{
			p.Angle += 0.6

			goto AngleLimitation
		}

	case native.PetalTypeFaster:
		{
			if now.Sub(p.LastFasterRagingVelocityAddition) >= fasterRagingApplyMS*time.Millisecond {
				p.AddRandomVelocity(5 * rand.Float32())

				p.LastFasterRagingVelocityAddition = now
			}

			// No need to do default talent
			return
		}

	case native.PetalTypeMissile:
		{
			if !p.Detached { // Not shooted, turn angle back on the player, then return
				masterX, masterY := p.MasterRealPosition()

				dx := p.X - masterX
				dy := p.Y - masterY

				// Calculate angle from player to petal
				p.Angle = math32.Mod(math32.Atan2(dy, dx)*angleFactor, 255)

				// No need to do default talent
				return
			}

			angle := p.Angle / angleFactor

			p.X += 10 * math32.Cos(angle)
			p.Y += 10 * math32.Sin(angle)
		}
	}

	{ // Default talent
		p.Angle += 0.3
	}

AngleLimitation: // Label for talents which only wants to do angle limitation
	p.Angle = math32.Mod(p.Angle, 255)
}
