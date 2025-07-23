package wave

import (
	"time"
)

func (p *Petal) PetalCoordinateBoundary(wp *Pool, _ time.Time) {
	if !p.Detached {
		return
	}

	mapRadius := float32(wp.Data.MapRadius)

	desiredMapRadius := mapRadius - p.Radius()

	dx := p.X - mapRadius
	dy := p.Y - mapRadius

	deadzone := desiredMapRadius * DeadzoneRadiusMultiplier

	if dx*dx+dy*dy > deadzone*deadzone {
		p.ForceEliminate(wp)
	}
}
