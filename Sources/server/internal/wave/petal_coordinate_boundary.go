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

	dx, dy := p.X-mapRadius, p.Y-mapRadius

	deadzone := desiredMapRadius * MobDeadzoneExpandMultiplier

	if dx*dx+dy*dy > deadzone*deadzone {
		p.ForceEliminate(wp)
	}
}
